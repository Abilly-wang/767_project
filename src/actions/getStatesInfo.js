import { useState, useEffect } from "react";
import { csv } from "d3";
import extraCSV from "../data/transform_df_oneyear_final.csv";

const csvFile = "https://gist.githubusercontent.com/JaneShaosyx/717a90505abe201d67d15d10606e8de7/raw/ba0ccf0d14f81fd523ff7a16f988d26507a5e536/state_mean.csv";

export const useStatesInfo = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        Promise.all([csv(csvFile), csv(extraCSV)]).then(([data1, data2]) => {
            const mergedData = data1.map(item => {
                const extraDataItem = data2.find(data2Item => data2Item.STATE == item.STATE && data2Item.MONTH == item.MONTH);
                return {
                    ...item,
                    MonthlyWindDirection: extraDataItem ? extraDataItem.MonthlyWindDirection : null,
                    MonthlyAvgTemp_scale: extraDataItem ? extraDataItem.MonthlyAvgTemp_scale : null,
                    MonthlyAvgPrec_scale: extraDataItem ? extraDataItem.MonthlyAvgPrecipitation_scale : null,
                };
            });
            setData(mergedData);
        });
    }, []);

    return data;
};
