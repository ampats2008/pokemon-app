import { MouseEventHandler } from "react";

// def Props
type Props = {
    onClick: MouseEventHandler,
    children: string
};

export const Button = ({onClick, children}: Props) => {
    
    return(
        <>
            <button className='btn-primary' onClick={onClick}>{children}</button>
        </>
    );
}