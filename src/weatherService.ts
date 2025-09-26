import { fetchWeatherApi } from 'openmeteo';
import { WeatherData, WEATHER_CODES } from './types';

export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';

  /**
   * Get current weather for a location
   */
  async getCurrentWeather(
    latitude: number,
    longitude: number,
    timezone?: string
  ): Promise<WeatherData> {
    try {
      const params = {
        latitude: [latitude],
        longitude: [longitude],
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'wind_speed_10m',
          'wind_direction_10m',
          'weather_code',
        ],
        timezone: timezone || 'auto',
      };

      const responses = await fetchWeatherApi(this.baseUrl, params);
      const response = responses[0];

      const current = response.current()!;

      return {
        latitude: response.latitude(),
        longitude: response.longitude(),
        timezone: response.timezone() || 'UTC',
        current: {
          time: new Date(
            (Number(current.time()) + Number(response.utcOffsetSeconds())) * 1000
          ).toISOString(),
          temperature: Math.round(current.variables(0)!.value() * 10) / 10,
          humidity: Math.round(current.variables(1)!.value()),
          windSpeed: Math.round(current.variables(2)!.value() * 10) / 10,
          windDirection: Math.round(current.variables(3)!.value()),
          weatherCode: current.variables(4)!.value(),
          weatherDescription: this.getWeatherDescription(current.variables(4)!.value()),
        },
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
