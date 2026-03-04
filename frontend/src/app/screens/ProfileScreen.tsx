import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import NeonCard from "../components/NeonCard";
import { GlowButton } from "../components/GlowButton";
import { authAPI, walletAPI } from "../api/apiclient";
import { LogOut, Wallet, Trophy, Target, DollarSign } from "lucide-react";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("nexouraUserId") || "";

  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>({ balance: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileRes, walletRes, txRes] = await Promise.all([
          userId ? authAPI.getProfile(userId) : Promise.resolve({ data: null }),
          walletAPI.getBalance(),
          walletAPI.getTransactions({ limit: 6 }),
        ]);

        setProfile(profileRes?.data || null);
        setWallet(walletRes?.data || { balance: 0 });
        setTransactions(Array.isArray(txRes?.data) ? txRes.data : []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const logout = () => {
    localStorage.removeItem("nexouraToken");
    localStorage.removeItem("nexouraUserId");
    localStorage.removeItem("nexouraRole");
    localStorage.removeItem("nexouraProfileCompleted");
    navigate("/login", { replace: true });
  };

  const formatDate = (value: any) => {
    if (!value) return "-";
    if (typeof value === "string") return new Date(value).toLocaleDateString();
    if (value?._seconds) return new Date(value._seconds * 1000).toLocaleDateString();
    return "-";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-br from-[#00d4ff]/15 to-[#7c3aed]/15 p-4 sm:p-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-4 flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-lg text-black"
            >
              {(profile?.username || profile?.gamerTag || "P").slice(0, 2).toUpperCase()}
            </motion.div>
            <div>
              <h2 className="text-xl sm:text-2xl">{profile?.username || profile?.gamerTag || "Player"}</h2>
              <p className="text-xs text-muted-foreground">Email: {profile?.email || "-"}</p>
              <p className="text-xs text-muted-foreground">Gaming UID: {profile?.gamingUID || "Not set"}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <NeonCard className="text-center" glowColor="blue">
              <Target className="mx-auto h-4 w-4 text-[#00d4ff]" />
              <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">Matches</p>
              <p className="text-sm">{Number(profile?.stats?.matches || 0)}</p>
            </NeonCard>
            <NeonCard className="text-center" glowColor="green">
              <Trophy className="mx-auto h-4 w-4 text-[#10b981]" />
              <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">Wins</p>
              <p className="text-sm">{Number(profile?.wins || 0)}</p>
            </NeonCard>
            <NeonCard className="text-center" glowColor="purple">
              <DollarSign className="mx-auto h-4 w-4 text-[#a855f7]" />
              <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">Earnings</p>
              <p className="text-sm">Rs.{Number(profile?.earnings || 0)}</p>
            </NeonCard>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 p-4 sm:p-6">
        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
        ) : null}

        {loading ? (
          <NeonCard><p className="text-sm text-muted-foreground">Loading profile...</p></NeonCard>
        ) : (
          <>
            <NeonCard glowColor="blue">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <h3 className="text-lg">Rs.{Number(wallet?.balance || 0)}</h3>
                </div>
                <button onClick={() => navigate("/app/wallet")} className="rounded-lg border border-border px-3 py-2 text-xs hover:border-primary">
                  <Wallet className="mr-1 inline h-3.5 w-3.5" />Wallet
                </button>
              </div>
            </NeonCard>

            <div>
              <h3 className="mb-3 text-base">Recent Transactions</h3>
              {transactions.length === 0 ? (
                <NeonCard><p className="text-sm text-muted-foreground">No transactions yet.</p></NeonCard>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <NeonCard key={tx.id} className="mb-2" glowColor="purple">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm">{String(tx.type || "transaction").toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                      </div>
                      <p className={`text-sm ${tx.type === "deposit" || tx.type === "reward" ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                        {tx.type === "deposit" || tx.type === "reward" ? "+" : "-"}Rs.{Number(tx.amount || 0)}
                      </p>
                    </div>
                  </NeonCard>
                ))
              )}
            </div>

            <GlowButton className="w-full" onClick={logout}>
              <LogOut className="mr-2 inline h-4 w-4" />
              Logout
            </GlowButton>
          </>
        )}
      </div>
    </div>
  );
}
