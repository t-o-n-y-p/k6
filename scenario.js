import http from 'k6/http';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    ya: {
      executor: 'ramping-arrival-rate',
      exec: 'getYaRu',
      startRate: 0,
      timeUnit: '1m',
      preAllocatedVUs: 12,
      stages: [
        { target: 60, duration: '5m' },
        { target: 60, duration: '10m' },
        { target: 72, duration: '5m' },
        { target: 72, duration: '10m' },
      ],
    },
    www: {
      executor: 'ramping-arrival-rate',
      exec: 'getWwwRu',
      startRate: 0,
      timeUnit: '1m',
      preAllocatedVUs: 24,
      stages: [
        { target: 120, duration: '5m' },
        { target: 120, duration: '10m' },
        { target: 144, duration: '5m' },
        { target: 144, duration: '10m' },
      ],
    },
  },
};

export function getYaRu() {
  http.get('http://ya.ru', { redirects: 0, tags: { my_tag: 'ya.ru' } });
}

export function getWwwRu() {
  http.get('http://www.ru', { tags: { my_tag: 'www.ru' } });
}