import { defineMock } from "./base";

export default defineMock([
  {
    url: "auth/captcha",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        captchaId: "2543984d-65da-479a-aa00-de584745",
        captchaBase64:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAoCAYAAAA16j4lAAADzklEQVR4Xu2ZXVNSQRiA+zfd9ke6abroqumiH9B40W0XWVbWmF2Y+R2W1ohpqYFIYKYCKgQqfoSQOgIin4IiAoe3s6vs4J4jNnpQz7rPzDuM593DjDzn7L7v7jXgMMt15wpcoy9y2ADJRXDBjMIFMw4XzDhcMONwwYzDBV8BeJt0BeCCGUcieMHrgw/fhuBVeyfUNLVBQ1cPmG3TsJfJ0EOZIOCPgmVyEQx6O4wMO2DKugzh8DY9TLUQwUKhAF8MJnjc0CwbbzTdEI0nSu9VPQvza6AbmpaN9bUtergqIYKNkzYis0c/Aqv+AGyGI2B1zsHz5g58vVXbX3qvqgkGokSmw74CicQOxGIp/Daja/rvM/ia2sGC03sZePquDUvsNfygx8CiOG0X5a8HgnRalfwcncUiJ8fdUBBnryL5vAAmo5OIVztY8JJvlQgMRaL0GMzLNg3OTzhcdEp1JBK75O0NBmN0GlY8AfIWZ7M5Oq0qsGDHwhKW96SxFQRBoMdgmj734jEjE1Y6pTp83iARnMvl6TQkk2mSD4XidFpVYMGZ/SwYxi0w75GfknbTe1BzOIVPz7nptOqYdfmwPDRNy4Gm7GGdHY/x/PHT6VOTFR+mkLiub8ZTx8ZuJkvfdiYkbZIcfUYzlvusqR2v12pnyrqE5U3ZlukUYdR8sEajSlsJkNx79b1ws7qzbNyq+QjeTemycVpOFGxxzpL12eqUf+LVRrFSts946BRh/Jcbj3E5fXTqVOSFAjxoGZIIpeNuXQ9sRJTrw8sKdnu8UP22hbROpdWmmrFMHAh2lBE8obDgi+JYwX83AqR16ugbkC1GzoxYoQpbMRBC0SNRiCn3BMtBpmjx8ziUnqIvClnBqFV60fIey23s7oF0BbYpC+Janrz/CLZvV8lG5quZvkUxikXW2OgcnSIM62bYLLK2UztQr+nCctH2JPq7IoiVe6qqViIWRfLOQ8iabPQdinFSm5RKKd8mXYoiay+zD42ftFhubasGInFl/rnLxpGNjoD0xyw+AEpudPx3kfVaC/6ocksUEZzL50HTP0jaoY3NUOk45kDTM5KItipLQVuVZpProAhjZasSVcdavZG0Q2gzI76dlASars+zkr5RV4WjEqBjwuJb/PvwsCEe3wGb5aAAY+qwAbVDRbknRdegjv6OilFJwQj3VTkuDIYj5DChXKCeeMA8Rn9HRSgVW0nJ/o2I2Bcv4MN+dOhvE1un8BY7596SKvqycF6CWYcLZhwumHG4YMbhghmHC2YcLphxuGDG4YIZhwtmHC6YcbhgxvkHYEJtBs+l3IIAAAAASUVORK5CYII=",
      },
      msg: "一切ok",
    },
  },

  {
    url: "auth/login",
    method: ["POST"],
    body: {
      code: "00000",
      data: {
        accessToken:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImRlcHRJZCI6MSwiZGF0YVNjb3BlIjoxLCJ1c2VySWQiOjIsImlhdCI6MTcyODE5MzA1MiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9BRE1JTiJdLCJqdGkiOiJhZDg3NzlhZDZlYWY0OWY3OTE4M2ZmYmI5OWM4MjExMSJ9.58YHwL3sNNC22jyAmOZeSm-7MITzfHb_epBIz7LvWeA",
        tokenType: "Bearer",
        refreshToken:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImRlcHRJZCI6MSwiZGF0YVNjb3BlIjoxLCJ1c2VySWQiOjIsImlhdCI6MTcyODE5MzA1MiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9BRE1JTiJdLCJqdGkiOiJhZDg3NzlhZDZlYWY0OWY3OTE4M2ZmYmI5OWM4MjExMSJ9.58YHwL3sNNC22jyAmOZeSm-7MITzfHb_epBIz7LvWeA",
        expiresIn: 7200,
      },
      msg: "一切ok",
    },
  },

  {
    url: "auth/refresh-token",
    method: ["POST"],
    body: {
      code: "00000",
      data: {
        accessToken:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImRlcHRJZCI6MSwiZGF0YVNjb3BlIjoxLCJ1c2VySWQiOjIsImlhdCI6MTcyODE5MzA1MiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9BRE1JTiJdLCJqdGkiOiJhZDg3NzlhZDZlYWY0OWY3OTE4M2ZmYmI5OWM4MjExMSJ9.58YHwL3sNNC22jyAmOZeSm-7MITzfHb_epBIz7LvWeA",
        tokenType: "Bearer",
        refreshToken:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImRlcHRJZCI6MSwiZGF0YVNjb3BlIjoxLCJ1c2VySWQiOjIsImlhdCI6MTcyODE5MzA1MiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9BRE1JTiJdLCJqdGkiOiJhZDg3NzlhZDZlYWY0OWY3OTE4M2ZmYmI5OWM4MjExMSJ9.58YHwL3sNNC22jyAmOZeSm-7MITzfHb_epBIz7LvWeA",
        expiresIn: 7200,
      },
      msg: "一切ok",
    },
  },

  {
    url: "auth/logout",
    method: ["POST"],
    body: {
      code: "00000",
      data: {},
      msg: "string",
    },
  },
]);
