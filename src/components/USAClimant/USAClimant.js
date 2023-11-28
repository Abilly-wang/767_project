import {
    geoAlbersUsa,
    geoPath,
    interpolateReds,
    interpolateBlues,
    interpolateYlGnBu,
    interpolateRgb,
    scaleSequential,
    scaleLinear,
    max,
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

//temperature
const colors0 = ["#3795d8", "#63962e", "#dc892c", "#99323f"];
const categories0 = ["cold", "cool", "warm", "hot"];
//rainfall
const colors1 = ["#adbe54", "#89a6be", "#2d6fd8", "#132d5b"];
const categories1 = ["trace", "light", "moderate", "heavy"];

const USAClimant = ({ USAtlas: { states, interiors }, statesInfo }) => {
    const [month, setMonth] = useState(1);
    const [dataMap, setDataMap] = useState(new Map());
    const [maxValue_temp, setMaxValue_temp] = useState(-100);
    const [minValue_temp, setMinValue_temp] = useState(100);
    const [maxValue_rain, setMaxValue_rain] = useState(-100);
    const [minValue_rain, setMinValue_rain] = useState(100);
    const [stateData, setStateData] = useState(0);
    const attribute_temp = "MonthlyAvgTemp";
    const attribute_rain = "MonthlyAvgPreciptation";
    useEffect(() => {
        let newMap = changeDataMap();
        setDataMap(newMap);
    }, [month]);

    const changeDataMap = () => {
        const newMap = new Map();
        let max_temp = -100;
        let min_temp = 100;
        let max_rain = -100;
        let min_rain = 100;
        statesInfo.forEach((d) => {
            if (d.MONTH == month) {
                newMap.set(AbbrToFull[d.STATE], [d[attribute_temp], d[attribute_rain]]);
                max_temp = Math.max(max_temp, d[attribute_temp]);
                min_temp = Math.min(min_temp, d[attribute_temp]);
                max_rain = Math.max(max_rain, d[attribute_rain]);
                min_rain = Math.min(min_rain, d[attribute_rain]);
            }
        });
        setMaxValue_temp(Number(max_temp).toFixed(2));
        setMinValue_temp(Number(min_temp).toFixed(2));
        setMaxValue_rain(Number(max_rain).toFixed(2));
        setMinValue_rain(Number(min_rain).toFixed(2));
        return newMap;
    };


    const handleMonthChange = (event) => {
        setMonth(event.target.value);
    };

    const handleMouseOver = (e, data) => {
        setStateData(data);
    }; 

    const mixColors = (colorA, colorB, mix = 0.5) => {
        // Use d3's interpolateRgb to get an interpolator between the two colors
        const interpolate = interpolateRgb(colorA, colorB);
        // mix is a value between 0 and 1, where 0 will be colorA, 1 will be colorB and 0.5 a 50-50 mix
        return interpolate(mix);
    };

    const temperatureColorScale = scaleSequential(interpolateReds).domain([
        minValue_temp,
        maxValue_temp,
    ]);
    
    const rainfallColorScale = scaleSequential(interpolateBlues).domain([
        minValue_rain,
        maxValue_rain,
    ]);
    
    const colorScale = (data, maxValue, minValue) => {
        return Math.floor((data - minValue + 0.01) / (maxValue - minValue + 0.01) / 0.25);
    };

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
                                    colors0[colorScale(data?data[0]:0, maxValue_temp, minValue_temp)],
                                    colors1[colorScale(data?data[1]:0, maxValue_rain, minValue_rain)],
                                     // This could also be a fixed value if you want a constant mix ratio
                                );
                               
                                  return (
                                      <path
                                          className="states"
                                          key={feature.id}
                                          d={path(feature)}
                                          fill={color}
                                          onMouseOver={(e) =>
                                            handleMouseOver(e, "Climate: " + 
                                            categories0[colorScale(data?data[0]:0, maxValue_temp, minValue_temp)] 
                                            + "-" + categories1[colorScale(data?data[1]:0, maxValue_rain, minValue_rain)])
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
        </Box>
    );
};

export default USAClimant;
