import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PageLoader from "@/components/PageLoader";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppShell from "@/layout/AppShell";
import { ROUTES } from "@/constants/routes";

const Marketplace = lazy(() => import("./pages/Marketplace"));
const ChannelDetails = lazy(() => import("./pages/ChannelDetails"));
const CreateDeal = lazy(() => import("./pages/CreateDeal"));
const CreatePreDeal = lazy(() => import("./pages/CreatePreDeal"));
const Deals = lazy(() => import("./pages/Deals"));
const DealDetails = lazy(() => import("./pages/DealDetails"));
const EscrowPayment = lazy(() => import("./pages/EscrowPayment"));
const FundsLocked = lazy(() => import("./pages/FundsLocked"));
const PreDealStatus = lazy(() => import("./pages/PreDealStatus"));
const Channels = lazy(() => import("./pages/Channels"));
const ChannelPendingVerification = lazy(
  () => import("./pages/channels/ChannelPendingVerification"),
);
const CreateListing = lazy(() => import("./pages/CreateListing"));
const ListingPreview = lazy(() => import("./pages/ListingPreview"));
const ListingSuccess = lazy(() => import("./pages/ListingSuccess"));
const EditListing = lazy(() => import("./pages/EditListing"));
const Profile = lazy(() => import("./pages/Profile"));
const AddChannelLayout = lazy(() => import("./pages/add-channel/AddChannelLayout"));
const AddChannelStep1 = lazy(() => import("./pages/add-channel/Step1"));
const AddChannelStep2 = lazy(() => import("./pages/add-channel/Step2"));
const AddChannelStep3 = lazy(() => import("./pages/add-channel/Step3"));
const ChannelManageLayout = lazy(
  () => import("./pages/channel-manage/ChannelManageLayout"),
);
const ListingsList = lazy(() => import("./pages/channel-manage/ListingsList"));
const ChannelSettings = lazy(() => import("./pages/channel-manage/ChannelSettings"));
const ChannelModerators = lazy(() => import("./pages/channel-manage/ChannelModerators"));
const Splash = lazy(() => import("./pages/Splash"));
const NotFound = lazy(() => import("./pages/NotFound"));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path={ROUTES.SPLASH}
          element={<Splash />}
        />
        <Route
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <AppShell />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={ROUTES.MARKETPLACE} replace />} />
          <Route path={ROUTES.MARKETPLACE} element={<Marketplace />} />
          <Route
            path={ROUTES.MARKETPLACE_CHANNEL_DETAILS(":channelId")}
            element={<ChannelDetails />}
          />
          <Route
            path={ROUTES.MARKETPLACE_CHANNEL_REQUEST(":channelId")}
            element={<CreateDeal />}
          />
          <Route path={ROUTES.DEAL_CREATE(":listingId")} element={<CreatePreDeal />} />
          <Route path={ROUTES.DEAL_PREDEAL(":id")} element={<PreDealStatus />} />
          <Route path={ROUTES.DEALS} element={<Deals />} />
          <Route path={ROUTES.DEAL_DETAILS(":dealId")} element={<DealDetails />} />
          <Route path={ROUTES.ESCROW(":dealId")} element={<EscrowPayment />} />
          <Route path={ROUTES.FUNDS_LOCKED} element={<FundsLocked />} />
          <Route path={ROUTES.CHANNELS} element={<Channels />} />
          <Route
            path={ROUTES.CHANNEL_PENDING(":id")}
            element={<ChannelPendingVerification />}
          />
          <Route path={ROUTES.CHANNEL_DETAILS(":channelId")} element={<ChannelDetails />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />

          <Route path={ROUTES.ADD_CHANNEL} element={<AddChannelLayout />}>
            <Route index element={<Navigate to="step-1" replace />} />
            <Route path="step-1" element={<AddChannelStep1 />} />
            <Route path="step-2" element={<AddChannelStep2 />} />
            <Route path="step-3" element={<AddChannelStep3 />} />
          </Route>

          <Route path={ROUTES.CHANNEL_MANAGE(":id")} element={<ChannelManageLayout />}>
            <Route index element={<Navigate to="listings" replace />} />
            <Route path="overview" element={<Navigate to="../listings" replace />} />
            <Route path="listings" element={<ListingsList />} />
            <Route path="listings/create" element={<CreateListing />} />
            <Route path="listings/preview" element={<ListingPreview />} />
            <Route path="listings/success" element={<ListingSuccess />} />
            <Route path="listings/:listingId/edit" element={<EditListing />} />
            <Route path="settings" element={<ChannelSettings />} />
            <Route path="moderators" element={<ChannelModerators />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
