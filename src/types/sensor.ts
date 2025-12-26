// Sensor data types for IoT warehouse project

export interface Sensor {
  id: string
  name: string
  position: {
    x: number
    y: number
    z: number
  }
  temperature: number // in Celsius
  humidity: number // percentage (0-100)
  lastUpdate: Date
}

export interface WarehouseConfig {
  width: number
  height: number
  depth: number
  floorHeight: number
}

