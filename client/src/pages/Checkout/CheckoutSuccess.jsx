import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import useAxiosPublic from "@/hooks/useAxiosPublic";

const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const axiosPublic = useAxiosPublic()
    useEffect(() => {
        const finalizeOrder = async () => {
            try {
                const sessionId = searchParams.get("session_id");

                if (!sessionId) {
                    setError("Missing Stripe session ID.");
                    setLoading(false);
                    return;
                }

                await axiosPublic.post(
                    "/payments/stripe/finalize",
                    { sessionId },
                    { withCredentials: false },
                );

                setDone(true);
            } catch (err) {
                setError(
                    err?.response?.data?.message ||
                    "Failed to finalize Stripe order.",
                );
            } finally {
                setLoading(false);
            }
        };

        finalizeOrder();
    }, [axiosPublic, searchParams]);

    return (
        <div className="container-page section-spacing">
            <div className="vault-card p-8 text-center">
                {loading ? (
                    <>
                        <h1 className="text-3xl font-black text-slate-900">
                            Finalizing your order...
                        </h1>
                        <p className="mt-3 text-slate-600">
                            Please wait while we save your paid order.
                        </p>
                    </>
                ) : done ? (
                    <>
                        <h1 className="text-3xl font-black text-slate-900">
                            Payment Successful
                        </h1>
                        <p className="mt-3 text-slate-600">
                            Your payment was successful and your order has been saved.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-black text-slate-900">
                            Something went wrong
                        </h1>
                        <p className="mt-3 text-rose-600">{error}</p>
                    </>
                )}

                <Link
                    to="/dashboard/my-orders"
                    className="mt-6 inline-flex rounded-2xl px-5 py-3 font-bold text-white"
                    style={{ background: "var(--primary)" }}
                >
                    Go to My Orders
                </Link>
            </div>
        </div>
    );
};

export default CheckoutSuccess;