import React, { SVGProps } from "react";

export const EnergyIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
    const { className, ...rest } = props;
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="32px"
            height="32px" viewBox="0 0 32 32"
            xmlSpace="preserve" fill="currentColor"
            {...rest}>
            <path d="M26.9 15.7c-.1-.4-.5-.7-.9-.7h-6l3.9-11.7c.1-.4 0-.9-.4-1.1-.4-.3-.8-.2-1.2 0l-17 13c-.3.3-.5.7-.3 1.1s.6.7 1 .7h6L8.1 28.7c-.1.4 0 .9.4 1.1.1.1.3.2.5.2s.4-.1.6-.2l17-13c.3-.3.5-.7.3-1.1" />
        </svg>
    )
}