import { useState } from "react";
import axios from "axios";

function BalanceChecker() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      // Make a request to your backend to fetch the balance
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/balance/${address}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      // Extract balance from the response data
      const { balance } = response.data;

      // Update state with the fetched balance
      setBalance(balance);
    } catch (error: any) {
      // Handle errors
      setError(
        error.message || "An error occurred while fetching the balance."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Ethereum Account Balance Checker</h1>
      <label htmlFor="address">Enter Ethereum Address:</label>
      <input
        type="text"
        id="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button onClick={getBalance} disabled={loading || !address}>
        Get Balance
      </button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {balance && <p>Balance: {balance} ETH</p>}
    </div>
  );
}

export default BalanceChecker;
