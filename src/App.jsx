import React, { useEffect, useRef, useState } from "react";
import "./index.css";

function useIntersectionObserver(ref, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observer = useRef(null);

  const cleanOb = () => {
    if (observer.current) {
      observer.current.disconnect();
    }
  };

  useEffect(() => {
    if (ref.current) {
      cleanOb();
      observer.current = new IntersectionObserver(([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      }, options);

      observer.current.observe(ref.current);
    }
    return () => {
      cleanOb();
    };
  }, [ref, options]);

  return isIntersecting;
}

function App() {
  const [launches, setLaunches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const targetRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const fetchLaunches = async () => {
    setIsLoading(true);

    const requestBody = {
      query: {},
      options: {
        limit: 10,
        page: page,
      },
    };

    const response = await fetch(
      "https://api.spacexdata.com/v4/launches/query",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (data.docs.length > 0) {
      setLaunches((prevLaunches) => [...prevLaunches, ...data.docs]);
      setPage((prevPage) => prevPage + 1);
    } else {
      setHasMore(false);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchLaunches();
  }, []);

  const isIntersecting = useIntersectionObserver(targetRef, {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
  });

  useEffect(() => {
    if (isIntersecting && hasMore) {
      fetchLaunches();
    }
  }, [isIntersecting]);

  return (
    <div className="min-h-max h-screen bg-[#f2f2f2] overflow-hidden">
      <div className="wrapper w-full h-full grid grid-cols-1 grid-rows-[auto_1fr_100px] justify-stretch items-center gap-8 py-8">
        <form action="">
          <input
            type="text"
            className="py-2 px-4 placeholder:italic border-2 rounded-sm border-neutral-200 w-full"
            placeholder="Enter keywords"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <ul className="bg-white border-2 border-sm border-neutral-200 p-8 self-stretch overflow-auto flex flex-col gap-8 max-h-[500px]">
          {launches.map((launch, index) => (
            <li
              key={launch.id}
              ref={index === launches.length - 1 ? targetRef : null}
              className="grid grid-cols-[100px_1fr] gap-8 items-center"
            >
              <div className="bg-neutral-200 aspect-square"></div>
              <div>
                <p className="font-semibold">
                  Flight Number <span>{launch.flight_number}</span>: &#160;
                  <span>{launch.name}</span> (
                  <span>{new Date(launch.date_utc).getFullYear()}</span>)
                </p>
                <p className="mt-2 text-neutral-400">
                  Details: {launch.details || "No details available"}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="text-center m-auto">
          {isLoading && (
            <div className="loader">
              <div className="inner-circle a"></div>
              <div className="inner-circle b"></div>

              <div className="outer-circle a"></div>
              <div className="outer-circle b"></div>
            </div>
          )}
          {!hasMore && <p>No more data to fetch</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
