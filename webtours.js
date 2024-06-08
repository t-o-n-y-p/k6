import http from 'k6/http';
import { check, group } from 'k6';
import { URLSearchParams } from 'https://jslib.k6.io/url/1.0.0/index.js';

const BASE_URL = 'http://webtours.load-test.ru:1090';

const departDate = new Date();
departDate.setMonth(departDate.getMonth() + 2);
const returnDate = new Date();
returnDate.setMonth(returnDate.getMonth() + 2);
returnDate.setDate(returnDate.getDate() + 1);
const dateOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
};

const username = 'tonyp21';
const password = '123456';

export function openMainPage() {
  let res = http.get(`${BASE_URL}/webtours/`, { tags: { my_tag: '/webtours/' } });
  check(
    res,
    { '/webtours/ status code is 200': (res) => res.status === 200 },
    { my_tag: '/webtours/ is 200' },
  );

  res = http.get(`${BASE_URL}/webtours/header.html`, { tags: { my_tag: '/webtours/header.html' } });
  check(
    res,
    { '/webtours/header.html status code is 200': (res) => res.status === 200 },
    { my_tag: '/webtours/header.html is 200' },
  );

  const welcomeParams =
    new URLSearchParams([
      ['signOff', 'true'],
    ]);
  res = http.get(
    `${BASE_URL}/cgi-bin/welcome.pl?${welcomeParams.toString()}`,
    { tags: { my_tag: '/cgi-bin/welcome.pl' } }
  );
  check(
    res,
    { '/cgi-bin/welcome.pl status code is 200': (res) => res.status === 200 },
    { my_tag: '/cgi-bin/welcome.pl is 200' },
  );

  const navParams =
    new URLSearchParams([
      ['in', 'home'],
    ]);
  res = http.get(
    `${BASE_URL}/cgi-bin/nav.pl?${navParams.toString()}`,
    { tags: { my_tag: '/cgi-bin/nav.pl' } }
  );
  check(
    res,
    { '/cgi-bin/nav.pl status code is 200': (res) => res.status === 200 },
    { my_tag: '/cgi-bin/nav.pl is 200' },
  );
  let token = res.html().find('input[name=userSession]').first().attr('value');

  res = http.get(
    `${BASE_URL}/WebTours/home.html`,
    { tags: { my_tag: '/WebTours/home.html' } }
  );
  check(
    res,
    { '/WebTours/home.html status code is 200 or 304': (res) => res.status === 200 || res.status === 304 },
    { my_tag: '/WebTours/home.html is 200 or 304' },
  );

  return token;
}

export function login(token) {
  let res = http.post(
    `${BASE_URL}/cgi-bin/login.pl`,
    {
      'userSession': token,
      'username': username,
      'password': password,
      'login.x': '58',
      'login.y': '11',
      'JSFormSubmit': 'off'
    },
    { tags: { my_tag: 'post /cgi-bin/login.pl' } }
  );
  check(
    res,
    { 'post /cgi-bin/login.pl status code is 200': (res) => res.status === 200 },
    { my_tag: 'post /cgi-bin/login.pl is 200' },
  );

  const navParams =
    new URLSearchParams([
      ['page', 'menu'],
      ['in', 'home'],
    ]);
  res = http.get(
    `${BASE_URL}/cgi-bin/nav.pl?${navParams.toString()}`,
    { tags: { my_tag: '/cgi-bin/nav.pl' } }
  );
  check(
    res,
    { '/cgi-bin/nav.pl status code is 200': (res) => res.status === 200 },
    { my_tag: '/cgi-bin/nav.pl is 200' },
  );

  const loginParams =
    new URLSearchParams([
      ['intro', 'true'],
    ]);
  res = http.get(
    `${BASE_URL}/cgi-bin/login.pl?${loginParams.toString()}`,
    { tags: { my_tag: 'get /cgi-bin/login.pl' } }
  );
  check(
    res,
    { 'get /cgi-bin/login.pl status code is 200': (res) => res.status === 200 },
    { my_tag: 'get /cgi-bin/login.pl is 200' },
  );
}

export function navToFlights() {
  const welcomeParams =
    new URLSearchParams([
      ['page', 'search'],
    ]);
  let res = http.get(
    `${BASE_URL}/cgi-bin/welcome.pl?${welcomeParams.toString()}`,
    { tags: { my_tag: '/cgi-bin/welcome.pl' } }
  );
  check(
    res,
    { '/cgi-bin/welcome.pl status code is 200': (res) => res.status === 200 },
    { my_tag: '/cgi-bin/welcome.pl is 200' },
  );

  const navParams =
    new URLSearchParams([
      ['page', 'menu'],
      ['in', 'flights'],
    ]);
  res = http.get(
    `${BASE_URL}/cgi-bin/nav.pl?${navParams.toString()}`,
    { tags: { my_tag: '/cgi-bin/nav.pl' } }
  );
  check(
    res,
    { '/cgi-bin/nav.pl status code is 200': (res) => res.status === 200 },
    { my_tag: '/cgi-bin/nav.pl is 200' },
  );

  const reservationsParams =
    new URLSearchParams([
      ['page', 'welcome'],
    ]);
  res = http.get(
    `${BASE_URL}/cgi-bin/reservations.pl?${reservationsParams.toString()}`,
    { tags: { my_tag: '/cgi-bin/reservations.pl' } }
  );
  check(
    res,
    { '/cgi-bin/reservations.pl status code is 200': (res) => res.status === 200 },
    { my_tag: '/cgi-bin/reservations.pl is 200' },
  );

  let selection = res.html().find('[name=depart] > option');
  let departCity = selection.eq(Math.floor(Math.random() * selection.size())).attr('value');
  selection = res.html().find('[name=arrive] > option');
  let arriveCity = selection.eq(Math.floor(Math.random() * selection.size())).attr('value');
  return {
    'departCity': departCity,
    'arriveCity': arriveCity
  }
}

export function findFlights(cities) {
  let res = http.post(
    `${BASE_URL}/cgi-bin/reservations.pl`,
    {
      'advanceDiscount': '0',
      'depart': cities.departCity,
      'departDate': departDate.toLocaleDateString("en-US", dateOptions),
      'arrive': cities.arriveCity,
      'returnDate': returnDate.toLocaleDateString("en-US", dateOptions),
      'numPassengers': '1',
      'seatPref': 'None',
      'seatType': 'Coach',
      'findFlights.x': '53',
      'findFlights.y': '11',
      '.cgifields': ['roundtrip', 'seatType', 'seatPref']
    },
    { tags: { my_tag: '/cgi-bin/reservations.pl' } }
  );
  check(
    res,
    { '/cgi-bin/reservations.pl status code is 200': (res) => res.status === 200 },
    { my_tag: '/cgi-bin/reservations.pl is 200' },
  );

  let selection = res.html().find('input[name=outboundFlight]');
  return selection.eq(Math.floor(Math.random() * selection.size())).attr('value');
}

export function reserveFlight(outboundFlight) {
  let res = http.post(
    `${BASE_URL}/cgi-bin/reservations.pl`,
    {
      'outboundFlight': outboundFlight,
      'advanceDiscount': '0',
      'numPassengers': '1',
      'seatPref': 'None',
      'seatType': 'Coach',
      'reserveFlights.x': '48',
      'reserveFlights.y': '12'
    },
    { tags: { my_tag: '/cgi-bin/reservations.pl' } }
  );
  check(
    res,
    { '/cgi-bin/reservations.pl status code is 200': (res) => res.status === 200 },
    { my_tag: '/cgi-bin/reservations.pl is 200' },
  );
}

export function buyFlight(outboundFlight) {
  let res = http.post(
    `${BASE_URL}/cgi-bin/reservations.pl`,
    {
      'firstName': 'Tony',
      'lastName': 'P',
      'address1': 'Street',
      'address2': 'Address',
      'pass1': 'Tony P',
      'creditCard': '123',
      'expDate': '01/99',
      'oldCCOption': '',
      'outboundFlight': outboundFlight,
      'returnFlight': '',
      'advanceDiscount': '0',
      'numPassengers': '1',
      'seatPref': 'None',
      'seatType': 'Coach',
      'JSFormSubmit': 'off',
      'buyFlights.x': '66',
      'buyFlights.y': '12',
      '.cgifields': ['saveCC']
    },
    { tags: { my_tag: '/cgi-bin/reservations.pl' } }
  );
  check(
    res,
    { '/cgi-bin/reservations.pl status code is 200': (res) => res.status === 200 },
    { my_tag: '/cgi-bin/reservations.pl is 200' },
  );
}

export default function () {
  let token;
  group('Open main page', () => { token = openMainPage(); });
  group('Login', () => { login(token); });
  let cities;
  group('Nav to flights', () => { cities = navToFlights(); });
  let outboundFlight;
  group('Find flights', () => { outboundFlight = findFlights(cities); });
  group('Reserve flight', () => { reserveFlight(outboundFlight); });
  group('Buy flight', () => { buyFlight(outboundFlight); });
  group('Open main page again', () => { openMainPage(); });
}