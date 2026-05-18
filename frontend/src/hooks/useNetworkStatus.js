import { useEffect, useState } from "react";

const getConnectionSpeed = () => {
  if (typeof navigator === "undefined") {
    return "medium";
  }

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) return "medium";

  const effectiveType = connection.effectiveType || "";

  if (effectiveType.includes("2g")) return "slow";
  if (effectiveType.includes("3g")) return "medium";
  if (effectiveType.includes("4g")) return "fast";

  return "medium";
};

const useNetworkStatus = () => {
  const [speed, setSpeed] = useState(getConnectionSpeed());

  useEffect(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (!connection) return;

    const updateSpeed = () => {
      setSpeed(getConnectionSpeed());
    };

    connection.addEventListener("change", updateSpeed);

    return () => {
      connection.removeEventListener("change", updateSpeed);
    };
  }, []);

  return speed;
};

export default useNetworkStatus;