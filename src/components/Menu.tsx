import React from 'react';
import { ISelectBall } from "./Canvas";

interface IProps {
	selectedBall: ISelectBall;
	handleColorSelection: ( color: string ) => void;
}

const Menu = ( { selectedBall, handleColorSelection }: IProps ) => {
	return (
			<div style={ { position: 'absolute', top: selectedBall.y, left: selectedBall.x } }>
				<div onClick={ () => handleColorSelection( 'red' ) }
				     style={ { backgroundColor: 'red', cursor: 'pointer' } }>Красный
				</div>
				<div onClick={ () => handleColorSelection( 'green' ) }
				     style={ { backgroundColor: 'green', cursor: 'pointer' } }>Зеленый
				</div>
				<div onClick={ () => handleColorSelection( 'blue' ) }
				     style={ { backgroundColor: 'blue', cursor: 'pointer' } }>Синий
				</div>
			</div>
	);
};

export default Menu;