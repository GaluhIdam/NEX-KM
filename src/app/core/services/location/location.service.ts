import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Country } from '../../dtos/location/country.dto';
import { State } from '../../dtos/location/state.dto';
import { City } from '../../dtos/location/city.dto';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private readonly _httpClient: HttpClient) {}

  // WEB SITE URL FOR USED PUBLIC API = https://countrystatecity.in

  httpOptions = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
      'X-CSCAPI-KEY':
        'Uko2aGhKOVYzN1FlZm55ZVJUT3l5a0owSVlScmNSZldvU25wUDZzbg==',
    }),
  };

  getCountries(): Observable<Country[]> {
    return this._httpClient.get<Country[]>(
      'https://api.countrystatecity.in/v1/countries',
      {
        headers: this.httpOptions.headers,
      }
    );
  }

  getStates(): Observable<State[]> {
    return this._httpClient.get<State[]>(
      'https://api.countrystatecity.in/v1/states',
      {
        headers: this.httpOptions.headers,
      }
    );
  }

  getCountryDetail(countryISO: string): Observable<Country> {
    return this._httpClient.get<Country>(
      `https://api.countrystatecity.in/v1/countries/${countryISO}`,
      {
        headers: this.httpOptions.headers,
      }
    );
  }

  getStatesBySelectedCountry(countryISO: string): Observable<State[]> {
    return this._httpClient.get<State[]>(
      `https://api.countrystatecity.in/v1/countries/${countryISO}/states`,
      {
        headers: this.httpOptions.headers,
      }
    );
  }

  getStateDetail(countryISO: string, stateISO: string): Observable<State> {
    return this._httpClient.get<State>(
      `https://api.countrystatecity.in/v1/countries/${countryISO}/states/${stateISO}`,
      {
        headers: this.httpOptions.headers,
      }
    );
  }

  getCitiesBySelectedCountryAndSelectedState(
    countryISO: string,
    stateISO: string
  ): Observable<City[]> {
    return this._httpClient.get<City[]>(
      `https://api.countrystatecity.in/v1/countries/${countryISO}/states/${stateISO}/cities`,
      {
        headers: this.httpOptions.headers,
      }
    );
  }
}
