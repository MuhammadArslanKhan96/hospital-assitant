import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Props for the AuthForm component.
 */
interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The source URL or base64 string for the company logo.
   */
  logoSrc: string;
  /**
   * Alt text for the company logo for accessibility.
   */
  logoAlt?: string;
  /**
   * The main title of the form.
   */
  title: string;
  /**
   * A short description or subtitle displayed below the title.
   */
  description?: string;
  /**
   * The primary call-to-action button (e.g., social login).
   */
  primaryAction: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  /**
   * An array of secondary action buttons.
   */
  secondaryActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }[];
  /**
   * An optional action for skipping the login process.
   */
  skipAction?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Custom content to be displayed in the footer area.
   */
  footerContent?: React.ReactNode;
}

/**
 * A reusable authentication form component built with shadcn/ui.
 * It supports various providers, a customizable header, and animations.
 */
const AuthForm = React.forwardRef<HTMLDivElement, AuthFormProps>(
  (
    {
      className,
      logoSrc,
      logoAlt = "Company Logo",
      title,
      description,
      primaryAction,
      secondaryActions,
      skipAction,
      footerContent,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("flex flex-col items-center justify-center", className)}>
        <Card
          ref={ref}
          className={cn(
            "w-full max-w-sm",
            "bg-slate-900 border-slate-800 text-white", // Apply dark theme by default
            // Entrance Animation from tailwindcss-animate
            "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500"
          )}
          {...props}
        >
          <CardHeader className="text-center">
            {/* Logo rendered from src */}
            <div className="mb-4 flex justify-center">
              <div className="bg-white p-1 rounded-lg">
                <img src={logoSrc} alt={logoAlt} className="h-12 w-12 object-contain rounded-[4px]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
            {description && <CardDescription className="text-slate-400">{description}</CardDescription>}
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* Primary Action Button */}
            <Button onClick={primaryAction.onClick} className="w-full transition-transform hover:scale-[1.03]">
              {primaryAction.icon}
              {primaryAction.label}
            </Button>

            {/* "OR" separator */}
            {secondaryActions && secondaryActions.length > 0 && (
              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500">or</span>
                </div>
              </div>
            )}

            {/* Secondary Action Buttons */}
            <div className="grid gap-2">
              {secondaryActions?.map((action, index) => (
                <Button key={index} variant="secondary" className="w-full transition-transform hover:scale-[1.03] bg-slate-800 text-slate-300 hover:bg-slate-700" onClick={action.onClick}>
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>

          {/* Skip Action Button */}
          {skipAction && (
            <CardFooter className="flex flex-col">
              <Button variant="outline" className="w-full transition-transform hover:scale-[1.03] border-slate-700 text-slate-300 hover:bg-slate-800" onClick={skipAction.onClick}>
                {skipAction.label}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Footer */}
        {footerContent && (
          <div className="mt-6 w-full max-w-sm px-8 text-center text-sm text-slate-500 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500 [animation-delay:200ms]">
            {footerContent}
          </div>
        )}
      </div>
    );
  }
);
AuthForm.displayName = "AuthForm";

export { AuthForm };
