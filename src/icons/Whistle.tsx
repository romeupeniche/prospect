import React, { SVGProps } from "react";

export const WhistleIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
    const { className, ...rest } = props;
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="32px"
            height="32px" viewBox="0 0 32 32"
            xmlSpace="preserve" fill="currentColor"
            {...rest}>
            <path d="M30 11H19.5q-.6 0-.9.6L17.4 14h-2.8l.8-1.6c.2-.3.1-.7 0-1-.2-.3-.5-.5-.9-.5h-4.2c-4.9 0-8.9 3.7-9.3 8.4-.2 2.5.7 4.9 2.4 6.8S7.5 29 10 29s4.9-1 6.6-2.9c3.7-4 8.4-6.8 13.7-8.2.4-.1.7-.5.7-1v-5c0-.5-.4-.9-1-.9M10 24c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4m7-16c.6 0 1-.4 1-1V4c0-.6-.4-1-1-1s-1 .4-1 1v3c0 .6.4 1 1 1m-3.5.9c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4l-2.1-2.1c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4zm6.3.3c.3 0 .5-.1.7-.3l2.1-2.1c.4-.4.4-1 0-1.4s-1-.4-1.4 0l-2.1 2.1c-.4.4-.4 1 0 1.4.2.2.5.3.7.3" /></svg>
    )
}