import React, { SVGProps } from "react";

export const ChevronRIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
    const { className, ...rest } = props;
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="32px"
            height="32px" viewBox="0 0 320 448"
            xmlSpace="preserve" fill="currentColor"
            {...rest}>
            <path d="M116.437 988.362 80 950.902l119.193-122.54L80 705.822l36.437-37.46 36.404 37.426-.034.034L272 828.362l-119.193 122.54.033.034z" transform="translate(0 -604.362)" /></svg>
    )
}