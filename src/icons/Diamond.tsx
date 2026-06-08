import React, { SVGProps } from "react";

export const DiamondIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
    const { className, ...rest } = props;
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="32px"
            height="32px" viewBox="0 0 16 16"
            xmlSpace="preserve" fill="none"
            {...rest}>
            <path fill="currentColor" d="M0 6h4l3 8.6zm16 0h-4l-3 8.6zm-8 9L5 6h6zM4 5H0l2-3zm12 0h-4l2-3zm-6 0H6l2-3zM3.34 2H7L5 5zM9 2h4l-2 3z" />
        </svg>
    )
}