"use client";
import { Button } from "@/components/ui/button";
import * as React from "react";

export default function BottomButton({
    children,
    className = "",
    ...props
}: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) {
    return (
        <div className="fixed left-1/2 transform -translate-x-1/2 bottom-0 w-full px-5 bg-background/80 backdrop-blur-sm sm:border-t pb-24 sm:pb-6 pt-2 flex justify-center sm:justify-end items-center">
            <Button
                className={` sm:max-w-sm w-full sm:w-fit rounded-full block ${className}`}
                {...props}
            >
                {children}
            </Button>
        </div>
    );
}