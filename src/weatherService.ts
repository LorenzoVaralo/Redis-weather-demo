import { fetchWeatherApi } from 'openmeteo';

// Weather data interfaces
export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  weatherDescription: string;
}


// Weather code descriptions mapping
const WEATHER_CODES: { [key: number]: string } = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';

  /**
   * Get current weather for a location
   */
  async getCurrentWeather(latitude: number, longitude: number, timezone?: string): Promise<WeatherData> {
    try {
      const params = {
        latitude: [latitude],
        longitude: [longitude],
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'wind_speed_10m',
          'wind_direction_10m',
          'weather_code'
        ],
        timezone: timezone || 'auto'
      };

      const responses = await fetchWeatherApi(this.baseUrl, params);
      const response = responses[0];

      const current = response.current()!;
      
      return {
        latitude: response.latitude(),
        longitude: response.longitude(),
        timezone: response.timezone() || 'UTC',
        current: {
          time: new Date((Number(current.time()) + Number(response.utcOffsetSeconds())) * 1000).toISOString(),
          temperature: Math.round(current.variables(0)!.value() * 10) / 10,
          humidity: Math.round(current.variables(1)!.value()),
          windSpeed: Math.round(current.variables(2)!.value() * 10) / 10,
          windDirection: Math.round(current.variables(3)!.value()),
          weatherCode: current.variables(4)!.value(),
          weatherDescription: this.getWeatherDescription(current.variables(4)!.value())
        }
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw new Error('Failed to fetch current weather data');
    }
  }

  /**
   * Get weather description from weather code
   */
  private getWeatherDescription(code: number): string {
    return WEATHER_CODES[code] || 'Unknown weather condition';
  }

}

// Export singleton instance
export const weatherService = new WeatherService();