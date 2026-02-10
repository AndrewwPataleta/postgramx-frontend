import { Check, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROUTES } from "@/constants/routes";

export default function FundsLocked() {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col min-h-screen">
      <PageContainer className="flex-1 flex flex-col">
        {/* Main content - centered */}
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="text-center space-y-6 w-full">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full">
              <Check size={48} className="text-primary" />
            </div>

            {/* Main Content */}
            <div className="glass p-8 rounded-lg space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Payment Secure</h1>
              <p className="text-muted-foreground">
                Your funds have been locked in escrow
              </p>

              {/* Locked Funds Info */}
              <div className="bg-secondary/50 p-6 rounded-lg space-y-2">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Lock size={20} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Escrow Locked
                  </span>
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary">2.5</span>
                  <span className="text-lg text-muted-foreground">TON</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Released when post is published and delivered
                </p>
              </div>

              {/* Explanation */}
              <div className="bg-secondary/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Your payment is now secured. It will be released once the
                  channel confirms the post has been published to your
                  specifications.
                </p>
              </div>
            </div>

            {/* Additional info placeholder */}
            <div className="glass p-8 rounded-lg text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl"></span>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Funds Locked Confirmation
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                This page will include:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 text-left bg-secondary/30 p-4 rounded-lg mb-6">
                <li>• Success state</li>
                <li>• Locked escrow indicator</li>
                <li>• Short explanation text</li>
                <li>• Continue button</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Continue interacting with the chat to generate this page content.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom button */}
        <div className="py-6 space-y-3">
          <Link
            to={ROUTES.DEALS}
            className="button-primary text-center py-4 text-base font-semibold"
          >
            Continue
          </Link>
          <Link
            to={ROUTES.MARKETPLACE}
            className="button-secondary text-center py-4 text-base font-semibold"
          >
            Back to Marketplace
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
