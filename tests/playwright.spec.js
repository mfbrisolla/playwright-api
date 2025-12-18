// @ts-check
import { test, expect } from '@playwright/test';

const BOOKING_ENDPOINT = 'booking';
const AUTH_ENDPOINT = 'auth';

test('GET - Status 200 - Request all booking with first and lastname set', async ({ request }) => {
  const searchParams = new URLSearchParams();
  searchParams.set('firstname', 'John');

  const response = await request.get(`/${BOOKING_ENDPOINT}/`, { params: searchParams });

  console.log(await response.json());

  expect(response.ok()).toBeTruthy();

  expect(response.status()).toBe(200);

});

test('PATCH - Status 200 - Get Token and Update Booking ID 1', async ({ request }) => {

    const postResponse  = await request.post(`/${AUTH_ENDPOINT}/`, { data: {
    "username" : "admin",
    "password" : "password123"
    }});

    console.log(await postResponse.json());

    expect(postResponse.ok()).toBeTruthy();
    expect(postResponse.status()).toBe(200);

    const responseBody = await postResponse.json();

    const partialUpdateResponse = await request.patch(`/${BOOKING_ENDPOINT}/1`, { data: {
        "firstname": "Marcelo",
        "lastname": "Teste"
    }, headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Cookie": `token=${responseBody.token}`
    }});

    const partialUpdateResponseBody = await partialUpdateResponse.json();

    expect(partialUpdateResponseBody).toHaveProperty('firstname', 'Marcelo');
    expect(partialUpdateResponseBody).toHaveProperty('lastname', 'Teste');
  
});

test('POST - Status 200 - Create new record', async ({ request }) => {
  const responsePost = await request.post(`/${BOOKING_ENDPOINT}/`, { data: {
    "firstname" : "Jim",
    "lastname" : "Brown",
    "totalprice" : 111,
    "depositpaid" : true,
    "bookingdates" : {
        "checkin" : "2018-01-01",
        "checkout" : "2019-01-01"
    },
    "additionalneeds" : "Breakfast"
}});

  const responsePostBody = await responsePost.json();
  const id = responsePostBody.bookingid;

  const responseGet = await request.get(`/${BOOKING_ENDPOINT}/${id}`, { headers: {
    "Accept": "application/json",
  } });


  const responseArray = [];
  responseArray.push(await responseGet.json());

  expect(responseArray).toContainEqual(expect.objectContaining({
        "firstname" : "Jim",
        "lastname" : "Brown",
        "totalprice" : 111,
        "depositpaid" : true,
        "bookingdates" : {
            "checkin" : "2018-01-01",
            "checkout" : "2019-01-01"
        },
        "additionalneeds" : "Breakfast"
    }));
  
});

test('GET - Status 200 - Request specific booking ID and validate via toContainEqual', async ({ request }) => {
  const response = await request.get(`/${BOOKING_ENDPOINT}/1`, { headers: {
    "Accept": "application/json"
  } });

  const responseArray = [];
  responseArray.push(await response.json());

  expect(response.ok()).toBeTruthy();

  expect(response.status()).toBe(200);
  
  expect(responseArray).toContainEqual(expect.objectContaining({ firstname: 'Marcelo', lastname: 'Teste' }));
});

test('GET - Status 200 - Request specific booking ID and validate via toBe', async ({ request }) => {
  const response = await request.get(`/${BOOKING_ENDPOINT}/1`, { headers: {
    "Accept": "application/json"
  } });

  const responseBody = await response.json();

  expect(responseBody.firstname).toBe('Marcelo');
});

test('GET - Status 200 - Request specific booking ID and validate only the field and NOT their values', async ({ request }) => {
  const response = await request.get(`/${BOOKING_ENDPOINT}/1`, { headers: {
    Accept: 'application/json'
  } });

  const responseBody = await response.json();

  expect(responseBody).toHaveProperty('firstname');
});
