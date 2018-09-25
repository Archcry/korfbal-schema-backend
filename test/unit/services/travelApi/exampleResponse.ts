export const travelResponseWithoutTraffic = (distance: number, duration: number) => `{
  "destination_addresses": [
      "Kolonieweg 2, 6952 GX Dieren, Netherlands"
  ],
  "origin_addresses": [
      "Marconistraat 18, 6902 PC Zevenaar, Netherlands"
  ],
  "rows": [
      {
          "elements": [
                  {
                    "distance": {
                      "text": "${Math.floor(distance / 1000)}",
                      "value": ${distance}
                  },
                  "duration": {
                      "text": "${Math.floor(duration / 60)} mins",
                      "value": ${duration}
                  },
                  "status": "OK"
              }
          ]
      }
  ],
  "status": "OK"
}`;

export const travelResponseWithTraffic = (distance: number, duration: number) => `{
  "destination_addresses": [
      "Kolonieweg 2, 6952 GX Dieren, Netherlands"
  ],
  "origin_addresses": [
      "Marconistraat 18, 6902 PC Zevenaar, Netherlands"
  ],
  "rows": [
      {
          "elements": [
              {
                  "distance": {
                      "text": "${Math.floor(distance / 1000)}",
                      "value": ${distance}
                  },
                  "duration": {
                      "text": "${Math.floor(duration / 60)} mins",
                      "value": ${duration}
                  },
                  "duration_in_traffic": {
                      "text": "${Math.floor((duration + 300) / 60)}",
                      "value": ${duration + 300}
                  },
                  "status": "OK"
              }
          ]
      }
  ],
  "status": "OK"
}`;
