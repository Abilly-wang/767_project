import {
    geoAlbersUsa,
    geoPath,
    interpolateBlues,
    interpolateYlGnBu,
    scaleSequential,
    scaleLinear,
} from "d3";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useState, useEffect, Fragment } from "react";
import "./styles.css";
import { AbbrToFull } from "../../constants/StateHash";

const projection = geoAlbersUsa();
const path = geoPath(projection);

const width = 960;
const height = 500;

const rainLegendColors = ["rgb(189, 218, 255)", "rgb(139, 190, 255)", "rgb(50, 118, 208)", "rgb(0, 57, 131)"];
const rainLegendLabels = ["Trace", "Light", "Moderate", "Heavy"];

const Legend = ({ colors, labels }) => (
    <div className="legend" style={{ marginRight: "20px" }}>
        {labels.map((label, i) => (
            <div key={i} className="legend-item">
                <svg width="50" height="22">
                    <rect width="40" height="20" fill={colors[i]} />
                </svg>
                <span>{label}</span>
            </div>
        ))}
    </div>
);

const USAPrecip = ({ USAtlas: { states, interiors }, statesInfo }) => {
    const [month, setMonth] = useState(1);
    const [dataMap, setDataMap] = useState(new Map());
    const [maxValue, setMaxValue] = useState(-100);
    const [minValue, setMinValue] = useState(100);
    const [stateData, setStateData] = useState(0);
    const attribute = "MonthlyAvgPreciptation";
    useEffect(() => {
        let newMap = changeDataMap();
        setDataMap(newMap);
    }, [month]);

    const changeDataMap = () => {
        const newMap = new Map();
        let max = -100;
        let min = 100;
        statesInfo.forEach((d) => {
            if (d.MONTH == month) {
                newMap.set(AbbrToFull[d.STATE], [d[attribute], d["MonthlyAvgPrec_scale"]]);
                max = Math.max(max, d[attribute]);
                min = Math.min(min, d[attribute]);
            }
        });
        setMaxValue(Number(max).toFixed(2));
        setMinValue(Number(min).toFixed(2));
        return newMap;
    };

    const handleMonthChange = (event) => {
        setMonth(event.target.value);
    };

    const handleMouseOver = (e, data) => {
        setStateData(Number(data).toFixed(2));
    };

    const colorScale = scaleSequential(interpolateBlues).domain([
        minValue,
        maxValue,
    ]);

    
    const months = Array.from(Array(12), (_, i) => i + 1);

    return (
        <Box sx={{ m: '5em auto' }}>
            <Box display="flex" alignItems="center" justifyContent="center">
                <FormControl sx={{ m: 2, minWidth: 120 }}>
                    <InputLabel>month</InputLabel>
                    <Select
                        value={month}
                        label="Month"
                        onChange={handleMonthChange}
                        autoWidth
                    >
                        {months.map((m, i) => {
                            return (
                                <MenuItem key={i} value={m}>
                                    {m}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Typography>{`max: ${maxValue} min: ${minValue} data: ${stateData}`}</Typography>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="center">
                <svg width={width} height={height}>
                    <g className="marks3">
                        {dataMap
                            ? states.features.map((feature) => {
                                  const data = dataMap.get(
                                      feature.properties.name
                                  );
                                  return (
                                      <path
                                          className="states"
                                          key={feature.id}
                                          d={path(feature)}
                                          fill={rainLegendColors[parseInt(data ? data[1] : 1, 10)-1]}
                                          onMouseOver={(e) =>
                                              handleMouseOver(e, data[0])
                                          }
                                      />
                                  );
                              })
                            : states.features.map((feature) => {
                                  return (
                                      <path
                                          className="states"
                                          key={feature.id}
                                          d={path(feature)}
                                      />
                                  );
                              })}
                        <path className="interiors3" d={path(interiors)} />
                    </g>
                </svg>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="left" flexDirection="row">
                <Legend colors={rainLegendColors} labels={rainLegendLabels} />
            </Box>
        </Box>
    );
};

export default USAPrecip;
