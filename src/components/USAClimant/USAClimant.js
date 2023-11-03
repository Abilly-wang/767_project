import {
    geoAlbersUsa,
    geoPath,
    interpolateReds,
    interpolateBlues,
    interpolateYlGnBu,
    interpolateRgb,
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

const USAClimant = ({ USAtlas: { states, interiors }, statesInfo }) => {
    const [month, setMonth] = useState(1);
    const [dataMap, setDataMap] = useState(new Map());
    const [maxValue, setMaxValue] = useState(-100);
    const [minValue, setMinValue] = useState(100);
    const [maxValue_rain, setMaxValue_rain] = useState(-100);
    const [minValue_rain, setMinValue_rain] = useState(100);
    const [stateData, setStateData] = useState(0);
    const attribute = "MonthlyAvgTemp";
    const attribute_rain = "MonthlyAvgPreciptation";
    useEffect(() => {
        let newMap = changeDataMap();
        setDataMap(newMap);
    }, [month]);

    const changeDataMap = () => {
        const newMap = new Map();
        let max = -100;
        let min = 100;
        let max_rain = -100;
        let min_rain = 100;
        statesInfo.forEach((d) => {
            if (d.MONTH == month) {
                newMap.set(AbbrToFull[d.STATE], [d[attribute], d[attribute_rain]]);
                max = Math.max(max, d[attribute]);
                min = Math.min(min, d[attribute]);
                max_rain = Math.max(max_rain, d[attribute_rain]);
                min_rain = Math.min(min_rain, d[attribute_rain]);
            }
        });
        setMaxValue(Number(max).toFixed(2));
        setMinValue(Number(min).toFixed(2));
        setMaxValue_rain(Number(max_rain).toFixed(2));
        setMinValue_rain(Number(min_rain).toFixed(2));
        return newMap;
    };


    const handleMonthChange = (event) => {
        setMonth(event.target.value);
    };

    const handleMouseOver = (e, data) => {
        setStateData(Number(data).toFixed(2));
    }; 

    const mixColors = (colorA, colorB, mix = 0.5) => {
        // Use d3's interpolateRgb to get an interpolator between the two colors
        const interpolate = interpolateRgb(colorA, colorB);
        // mix is a value between 0 and 1, where 0 will be colorA, 1 will be colorB and 0.5 a 50-50 mix
        return interpolate(mix);
    };

    const temperatureColorScale = scaleSequential(interpolateReds).domain([
        minValue,
        maxValue,
    ]);
    
    const rainfallColorScale = scaleSequential(interpolateBlues).domain([
        minValue_rain,
        maxValue_rain,
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
                <Typography>{`data: ${stateData}`}</Typography>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="center">
                <svg width={width} height={height}>
                    <g className="marks4">
                        {dataMap
                            ? states.features.map((feature) => {
                                  const data = dataMap.get(
                                      feature.properties.name
                                  );
                                // console.log(data[1])
                                  const color = mixColors(
                                    temperatureColorScale(data?data[0]:0),
                                    rainfallColorScale(data?data[1]:0),
                                     // This could also be a fixed value if you want a constant mix ratio
                                );
                               
                                  return (
                                      <path
                                          className="states"
                                          key={feature.id}
                                          d={path(feature)}
                                          fill={color}
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
                        <path className="interiors4" d={path(interiors)} />
                    </g>
                </svg>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="left" flexDirection="row">
                <Typography variant="caption" display="block" gutterBottom fontSize="1em">
                    Temperature Scale (°C)
                </Typography>
                <svg width="300" height="50">
                    <defs>
                    <linearGradient id="temperature-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={temperatureColorScale(minValue)} />
                        <stop offset="100%" stopColor={temperatureColorScale(maxValue)} />
                    </linearGradient>
                    </defs>
                    <rect x="10" y="10" width="280" height="20" fill="url(#temperature-gradient)" />
                    <text x="10" y="40" textAnchor="start">{minValue}</text>
                    <text x="290" y="40" textAnchor="end">{maxValue}</text>
                </svg>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="left" flexDirection="row">
                <Typography variant="caption" display="block" gutterBottom fontSize="1em">
                    Preciptation Scale (mm)
                </Typography>
                <svg width="300" height="50">
                    <defs>
                    <linearGradient id="rain-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={rainfallColorScale(minValue)} />
                        <stop offset="100%" stopColor={rainfallColorScale(maxValue)} />
                    </linearGradient>
                    </defs>
                    <rect x="10" y="10" width="280" height="20" fill="url(#rain-gradient)" />
                    <text x="10" y="40" textAnchor="start">{minValue_rain}</text>
                    <text x="290" y="40" textAnchor="end">{maxValue_rain}</text>
                </svg>
            </Box>
        </Box>
    );
};

export default USAClimant;
