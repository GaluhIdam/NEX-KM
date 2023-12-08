export interface State {
  id: number;
  name: string;
  iso2: string;
  country_id: number;
  country_code: string;
  country_name: string;
  state_code: string;
  type: string | null;
  latitude: string;
  longitude: string;
}

export const stateDefaultData: State = {
  id: 0,
  name: '',
  iso2: '',
  country_id: 0,
  country_code: '',
  country_name: '',
  state_code: '',
  type: null,
  latitude: '',
  longitude: '',
};
