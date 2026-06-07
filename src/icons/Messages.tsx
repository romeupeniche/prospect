import React, { SVGProps } from "react";

export const MessagesIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
    const { className, ...rest } = props;
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="32px"
            height="32px" viewBox="0 0 24 24"
            xmlSpace="preserve" fill="currentColor"
            {...rest}>
            <path d="M7.734 20.769a9.9 9.9 0 0 1-4.876.981c-.285 0-.584-.006-.887-.018a.74.74 0 0 1-.65-.432.74.74 0 0 1 .085-.775 11.2 11.2 0 0 0 2.072-3.787A9.751 9.751 0 1 1 12 21.75a9.66 9.66 0 0 1-4.266-.981m.323-1.519a8.247 8.247 0 1 0-3.139-3.015.75.75 0 0 1 .092.535 10.2 10.2 0 0 1-1.561 3.47 7.2 7.2 0 0 0 3.816-.947.75.75 0 0 1 .431-.136.76.76 0 0 1 .361.093M8 14.75a.75.75 0 0 1 0-1.5h7a.75.75 0 0 1 0 1.5Zm0-4a.75.75 0 0 1 0-1.5h5a.75.75 0 1 1 0 1.5Z" /></svg>
    )
}