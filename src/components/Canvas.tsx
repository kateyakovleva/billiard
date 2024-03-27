import React, { useEffect, useRef, useState } from 'react';
import Menu from "./Menu";

export interface IBall {
	x: number;
	y: number;
	radius: number;
	speedX: number;
	speedY: number;
	color: string;
}

export interface ISelectBall {
	x: number;
	y: number;
	index: number;
}

function isInBall( ball: IBall, x: number, y: number ) {
	return Math.abs( ball.x - x ) < ball.radius && Math.abs( ball.y - y ) < ball.radius;
}

const balls: IBall[] = [
	{ x: 190, y: 109, radius: 30, speedX: 0.1, speedY: 0.5, color: 'black' },
	{ x: 234, y: 432, radius: 50, speedX: 0.5, speedY: 0.1, color: 'green' },
	{ x: 533, y: 122, radius: 90, speedX: 0.1, speedY: 0.5, color: 'blue' },
	{ x: 643, y: 421, radius: 70, speedX: 0.5, speedY: 0.1, color: 'orange' },
];

const store: any = {
	menuIsOpen: false,
	dragBallIndex: null,
}

const Canvas = () => {

	const canvasRef = useRef<HTMLCanvasElement | null>( null );
	const [ selectedBall, setSelectedBall ] = useState<null | ISelectBall>( null );

	const draw = ( context: CanvasRenderingContext2D, ball: IBall ) => {
		context.beginPath();
		context.arc( ball.x, ball.y, ball.radius, 0, Math.PI * 2, true );
		context.closePath();
		context.fillStyle = ball.color;
		context.fill();
	}

	const initCanvas = () => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext( '2d' );

		if ( context && canvas != undefined ) {

			context.fillStyle = 'white';
			context.fillRect( 0, 0, canvas.width, canvas.height );

			balls.forEach( ( ball ) => {
				context?.beginPath();
				context?.arc( ball.x, ball.y, ball.radius, 0, 2 * Math.PI );
				if ( context != undefined ) {
					context.fillStyle = ball.color;
				}
				context?.fill();
				context?.closePath();

				draw( context, ball )
			} );
		}
	};

	const checkCollision = ( ballA: IBall, ballB: IBall ) => {
		const dx = ballB.x - ballA.x;
		const dy = ballB.y - ballA.y;
		const distance = Math.sqrt( dx * dx + dy * dy );

		if ( distance < ballA.radius + ballB.radius ) {
			const angle = Math.atan2( dy, dx );
			const sin = Math.sin( angle );
			const cos = Math.cos( angle );
			ballB.speedX = cos + sin;
			ballB.speedY = cos - sin;
		}
	};

	const animate = () => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext( '2d' );
		if ( canvas && context ) {
			context.clearRect( 0, 0, canvas.width, canvas.height )
			context.fillStyle = 'white';
			context.fillRect( 0, 0, canvas.width, canvas.height );
			balls.forEach( ( ball, i ) => {
				draw( context, ball );

				if ( i === store.dragBallIndex ) return;
				balls.forEach( ( otherBall, j ) => {
					if ( i !== j ) {
						checkCollision( ball, otherBall );
					}

					if ( ball.x + ball.speedX > canvas.width - ball.radius || ball.x + ball.speedX < ball.radius ) {
						ball.speedX = -ball.speedX * 0.2;
					}

					if ( ball.y + ball.speedY > canvas.height - ball.radius || ball.y + ball.speedY < ball.radius ) {
						ball.speedY = -ball.speedY * 0.2;
					}

					if ( ball.y + ball.speedY > canvas.height || ball.y + ball.speedY < 0 ) {
						ball.speedY = -ball.speedY;
					}

					if ( ball.x + ball.speedX > canvas.width || ball.x + ball.speedX < 0 ) {
						ball.speedX = -ball.speedX;
					}

					ball.x += ball.speedX;
					ball.y += ball.speedY;

				} )
			} );

			if ( !store.menuIsOpen ) {
				requestAnimationFrame( animate );
			}
		}
	};

	const closeMenuAndStartAnimate = () => {
		store.menuIsOpen = false;
		animate();
		setSelectedBall( null )
	}

	const clickInCanvas = ( e: any ) => {
		handleDragBall( e );
		handleOpenMenu( e );
	}

	const handleOpenMenu = ( e: any ) => {
		if ( e.button !== 2 ) return;

		const canvas = canvasRef.current;
		let mouseX = e.clientX - canvas!.getBoundingClientRect().left;
		let mouseY = e.clientY - canvas!.getBoundingClientRect().top;

		let clickedInBall = false;
		balls.forEach( ( b, i ) => {
			if ( isInBall( b, mouseX, mouseY ) ) {
				clickedInBall = true;
				store.menuIsOpen = true;
				setSelectedBall( {
					x: mouseX,
					y: mouseY,
					index: i
				} )
			}
		} )

		if ( !clickedInBall && store.menuIsOpen ) {
			closeMenuAndStartAnimate();
		}
	}

	const handleDragBall = ( e: any ) => {
		if ( e.button !== 0 ) return;

		const canvas = canvasRef.current;
		let mouseX = e.clientX - canvas!.getBoundingClientRect().left;
		let mouseY = e.clientY - canvas!.getBoundingClientRect().top;

		let clickedInBall = false;
		balls.forEach( ( ball, i ) => {
			if ( isInBall( ball, mouseX, mouseY ) ) {
				ball.speedX = 0;
				ball.speedY = 0;
				ball.x = mouseX;
				ball.y = mouseY;
				store.dragBallIndex = i;
				clickedInBall = true;

				const moveBall = ( e: any ) => {
					ball.x = e.clientX - canvas!.getBoundingClientRect().left;
					ball.y = e.clientY - canvas!.getBoundingClientRect().top;
				}
				const dragBall = ( e: any ) => {
					store.dragBallIndex = null;
					const angle = Math.atan2( ball.y - mouseY, ball.x - mouseX );
					ball.speedX += Math.cos( angle );
					ball.speedY += Math.sin( angle );

					canvas?.removeEventListener( 'mousemove', moveBall )
					canvas?.removeEventListener( 'mouseup', dragBall )
				}
				canvas?.addEventListener( 'mousemove', moveBall )
				canvas?.addEventListener( 'mouseup', dragBall )
			}
		} )
	}

	useEffect( () => {
		window.oncontextmenu = () => false;
		initCanvas();
		animate();
	}, [] );

	return (
			<div style={ { position: 'relative' } }>
				{ selectedBall !== null &&
						<Menu
								selectedBall={ selectedBall }
								handleColorSelection={ ( color ) => {
									balls[ selectedBall.index ].color = color;
									closeMenuAndStartAnimate();
								} }
						/>
				}

				<canvas
						ref={ canvasRef }
						width={ 1300 }
						height={ 900 }
						onMouseDown={ clickInCanvas }
				>
				</canvas>
			</div>
	);
};

export default Canvas;