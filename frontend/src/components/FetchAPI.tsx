// src/components/Portfolio.tsx
import React, { useState } from "react";
import axios from "axios";

const FetchAPI: React.FC = () => {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [apiList, setApiList] = useState([]);
  const [error, setError] = useState("");

  const fetchPublicAPIs = async () => {
    try {
      let apiUrl = `${import.meta.env.VITE_SERVER_URL}/api/publicapis`;
      const params = [];
      if (category) {
        params.push(`category=${encodeURIComponent(category)}`);
      }
      if (limit) {
        params.push(`limit=${encodeURIComponent(limit)}`);
      }
      if (params.length > 0) {
        apiUrl += `?${params.join("&")}`;
      }
      console.log("apiurl", apiUrl);
      const response = await axios.get(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      console.log(response.data);
      setApiList(response.data.entries);
      setError("");
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.error || "Internal Server Error");
      } else {
        setError("Network Error");
      }
      setApiList([]);
    }
  };

  return (
    <div>
      <h1>Public APIs</h1>
      <div>
        <label htmlFor="category">Category:</label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Enter category"
        />
      </div>
      <div>
        <label htmlFor="limit">Limit:</label>
        <input
          type="number"
          id="limit"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="Enter limit"
        />
      </div>
      <button onClick={fetchPublicAPIs}>Fetch APIs</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {apiList.map((api: any, index) => (
          <li key={index}>{`${api.API} - ${api.Description}`}</li>
        ))}
      </ul>
    </div>
  );
};
export default FetchAPI;
