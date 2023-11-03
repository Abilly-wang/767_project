import { useState, useEffect } from "react";
import { csv } from "d3";

const csvFile =
    "https://gist.githubusercontent.com/JaneShaosyx/8ab77d5f02ca0bbbccd0defd8f528cff/raw/48dcc4a3b163a9ac9a872a7d293c803adf1415bc/clusters.csv";

export const useClustersInfo = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        csv(csvFile).then(setData);
    }, []);

    return data;
};
