import React, { SVGProps } from "react";

export const CalendarIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
    const { className, ...rest } = props;
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="32px"
            height="32px" viewBox="0 0 24 24"
            xmlSpace="preserve" fill="currentColor"
            {...rest}>
            <path fillRule="evenodd" d="M17 2a1 1 0 0 1 1 1v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 1 1 2 0v1h8V3a1 1 0 0 1 1-1M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7zm0-2h16V7a1 1 0 0 0-1-1h-1v1a1 1 0 0 1-2 0V6H8v1a1 1 0 1 1-2 0V6H5a1 1 0 0 0-1 1z" /></svg>
    )
}