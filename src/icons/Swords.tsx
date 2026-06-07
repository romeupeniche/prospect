import React, { SVGProps } from "react";

export const SwordsIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
    const { className, ...rest } = props;
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="32px"
            height="32px" viewBox="0 0 16 16"
            xmlSpace="preserve"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            {...rest}>
            <path d="m2.75 9.25 1.5 2.5 2 1.5m-4.5 0 1 1m1.5-2.5-1.5 1.5m3-1 8.5-8.5v-2h-2l-8.5 8.5" /><path d="M10.25 12.25 8 10m2-2 2.25 2.25m1-1-1.5 2.5-2 1.5m4.5 0-1 1m-1.5-2.5 1.5 1.5M6 8 1.75 3.75v-2h2L8 6" /></svg>
    )
}