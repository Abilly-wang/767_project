import { useState, useEffect } from "react";
import { csv } from "d3";

const csvFile = "https://gist.githubusercontent.com/JaneShaosyx/717a90505abe201d67d15d10606e8de7/raw/ba0ccf0d14f81fd523ff7a16f988d26507a5e536/state_mean.csv";

export const useStatesInfo = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        csv(csvFile).then(setData);
    }, []);

    return data;
};
