import React, { useEffect, useState } from 'react';
import{ FormControl, Select, MenuItem, Card, CardContent } from '@material-ui/core';
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";

function App() {

  const[countries, Setcountries] = useState([]);
  const[country, setCountry] = useState('worldwide');
  const[countryInfo, setCountryInfo] = useState({});
  const[tableData, setTableData] = useState([]);
  const[mapCenter, setMapCenter] = useState( { lat: 34.80746, lng: -40.4796 } );
  const[mapZoom, setMapZoom] = useState(3);
  const[mapCountries, setMapCountries] = useState([]);
  const[casesType, setCasesType] = useState('cases');

  useEffect(() => {
    
    const getcountriesdata = async() => {
      await fetch('https://disease.sh/v3/covid-19/countries')
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          Setcountries(countries);
          setMapCountries(data);
      });
    };

    getcountriesdata();

  }, []);

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    });
  }, []);

  const onCountrychange = async(event) => {
    const countryCode = event.target.value;

    const url = countryCode === 'worldwide' 
    ? 'https://disease.sh/v3/covid-19/all' 
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
    .then((response) => response.json())
    .then((data) => {

      setCountry(countryCode);
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat,data.countryInfo.long]);
      setMapZoom(4);

    });
  };

  return (
    <div className="app">
      <div className='app__left'>
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" onChange={onCountrychange} value={country} >
            <MenuItem value="worldwide">Worldwide</MenuItem>
                {
                  countries.map((country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
                };
            </Select>
          </FormControl>
        </div>
        
        <div className='app__states'>
          <InfoBox title="Coronavirus Cases" isRed active={casesType === "cases"} onClick={(e) => setCasesType('cases')} cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}/> 

          <InfoBox title="Recovered" active={casesType === "recovered"} onClick={(e) => setCasesType('recovered')} cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}/>   

          <InfoBox title="Deaths" isRed active={casesType === "deaths"} onClick={(e) => setCasesType('deaths')} cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}/>        
          
        </div>

        <Map 
          casesType={casesType}
          countries = {mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className='app__right'>
        <CardContent>
          <h3>Live Cases By Country</h3>
          <Table countries={tableData}/>
          <h3 className='app__graph_title'>Worldwide new {casesType} </h3>
          <LineGraph className='app__graph' casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
