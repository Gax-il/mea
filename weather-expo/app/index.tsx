import { Text, View } from "react-native";
import { Params, WeatherData } from "./types";
import { useEffect, useState } from "react";
import RNDateTimePicker from "@react-native-community/datetimepicker";

export default function Index() {
  const [weatherData, setWeatherData] = useState<undefined | WeatherData>();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 3600 * 1000 * 24 * 7));

  const params: Params = {
    latitude: 52.52,
    longitude: 13.41,
    hourly: "temperature_2m",
    start_date: startDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
    end_date: endDate.toISOString().split('T')[0],     // Convert to YYYY-MM-DD format
  };

  const url = "https://api.open-meteo.com/v1/forecast";

  useEffect(() => {
    const fetchWeather = async (url: string, params: Params) => {
      try {
        const response = await fetch(
          `${url}?latitude=${params.latitude}&longitude=${params.longitude}&hourly=${params.hourly}&start_date=${params.start_date}&end_date=${params.end_date}`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = (await response.json()) as WeatherData;
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    const getWeatherData = async () => {
      try {
        const data = await fetchWeather(url, params);
        setWeatherData(data);
      } catch (error) {
        console.error(error);
      }
    };

    getWeatherData();
  }, [startDate, endDate]); // Add 'startDate' and 'endDate' to dependency array

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <RNDateTimePicker
        value={startDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          if (selectedDate) {
            setStartDate(selectedDate);
          }
        }}
      />
      <RNDateTimePicker
        value={endDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          if (selectedDate) {
            setEndDate(selectedDate);
          }
        }}
      />
      {/* {weatherData?.hourly.temperature_2m.map((temp, index) => { */}
        {/* return <Text key={index}>{temp}</Text>; */}
      {/* })} */}
    </View>
  );
}