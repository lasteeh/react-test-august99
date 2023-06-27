import React, { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [launches, setLaunches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [endOfList, setEndOfList] = useState(false);

  const [page, setPage] = useState(1);

  const fetchLaunches = async () => {
    setIsLoading(true);
    const response = await fetch(
      `https://api.spacexdata.com/v4/launches?limit=10&page=${page}`
    );
    const data = await response.json();

    if (data.length > 0) {
      setLaunches((prevLaunches) => [...prevLaunches, ...data]);
      setPage((prevPage) => prevPage + 1);
    } else {
      setEndOfList(true);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchLaunches();
  }, []);

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight
    ) {
      fetchLaunches();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="mih-h-screen">
      <form action="">
        <input type="text" />
      </form>
      <ul>
        {launches.map((launch) => (
          <li key={launch.id}>{launch.name}</li>
        ))}
      </ul>
      {isLoading && <p>Loading...</p>}
      {endOfList && <p>No more data to fetch</p>}
    </div>
  );
}

export default App;
