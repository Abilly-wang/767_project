import {
    geoAlbersUsa,
    geoPath,
    interpolateReds,
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
import Container from "@mui/material/Container";
import "./styles.css";
import { AbbrToFull } from "../../constants/StateHash";

const projection = geoAlbersUsa();
const path = geoPath(projection);

const width = 960;
const height = 500;

const USAPoint = ({ USAtlas: { states, interiors }, statesInfo }) => {
    const [month, setMonth] = useState(1);
    const [dataMap, setDataMap] = useState(new Map());
    const [maxValue, setMaxValue] = useState(-100);
    const [minValue, setMinValue] = useState(100);
    const [stateData, setStateData] = useState(0);
    const attribute = "MonthlyAvgTemp";
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
                newMap.set(AbbrToFull[d.STATE], d[attribute]);
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

    const colorScale = scaleSequential(interpolateReds).domain([
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
                    <g className="marks2">
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
                                          fill={colorScale(data?data:0)}
                                          onMouseOver={(e) =>
                                              handleMouseOver(e, data)
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
                        <path className="interiors2" d={path(interiors)} />
                    </g>
                </svg>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="left" flexDirection="row">
                <Typography variant="caption" display="block" gutterBottom fontSize="1em">
                    Temperature Scale (°C)
                </Typography>
                <svg width="300" height="85">
                    <defs>
                    <linearGradient id="temperature-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={colorScale(minValue)} />
                        <stop offset="100%" stopColor={colorScale(maxValue)} />
                    </linearGradient>
                    </defs>
                    <rect x="10" y="30" width="280" height="20" fill="url(#temperature-gradient)" />
                    <text x="10" y="65" textAnchor="start">{minValue}</text>
                    <text x="290" y="65" textAnchor="end">{maxValue}</text>
                </svg>
            </Box>
        </Box>
    );
};

export default USAPoint;
