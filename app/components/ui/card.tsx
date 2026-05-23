import * as React from "react";
import { cn } from "./utils";

type CardProps = React.ComponentProps<"div"> & {
  hover?: boolean;
};

function Card({ className, hover, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        hover && "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "px-6 pt-6 flex flex-col gap-1.5",
        className
      )}
      {...props}
    />
  );
}

type CardTitleProps = React.ComponentProps<"h4">;

function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h4
      data-slot="card-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    >
      {children}
    </h4>
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("px-6 pb-6 flex items-center", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};