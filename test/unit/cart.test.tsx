import axios from 'axios';
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Application } from '../../src/client/Application';

import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { initStore } from '../../src/client/store';
import { ExampleApi, CartApi } from '../../src/client/api';
import exp from 'constants';

const basename = '/hw/store';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const LOCAL_STORAGE_CART_KEY = 'example-store-cart';

const mockProducts = [
    {
        id: 1,
        name: 'Incredible kogtetochka',
        price: 348,
        description: "Really Ergonomic kogtetochka for Cornish Rex",
        color: "Maroon",
        material: "Metal"
    },
    {
        id: 2,
        name: 'Rustic kogtetochka',
        price: 209,
        description: "Really Intelligent kogtetochka for Selkirk Rex",
        color: "Ivory",
        material: "Steel"
    },
];

describe("тест Корзины", () => {
    beforeEach(() => {
        mockedAxios.get.mockImplementation((url) => {
            if (url === '/hw/store/api/products') {
                return Promise.resolve({ data: mockProducts });
            } else if (url.startsWith('/hw/store/api/products/')) {
                const id = parseInt(url.split('/').pop() || '', 10);
                return Promise.resolve({ data: mockProducts.find(product => product.id === id) });
            }
            return Promise.reject(new Error('not found'));
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('в шапке отображаться количество не повторяющихся товаров в корзине', async () => {
        const api = new ExampleApi(basename);
        const cart = {
            getState: jest.fn().mockReturnValue({
                1: { name: mockProducts[0].name, count: 2, price: mockProducts[0].price },
                2: { name: mockProducts[1].name, count: 2, price: mockProducts[0].price },
            }),
            setState: jest.fn()
        };
        const store = initStore(api, cart);

        const application = (
            <BrowserRouter basename={basename}>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );
        window.history.pushState({}, 'Test page', basename);

        const { container } = render(application);

        await waitFor(() => {
            expect(screen.getByText(`Cart (${2})`)).toBeInTheDocument();
        });
    });

    it('в корзине должна отображаться таблица с добавленными в нее товарами', async () => {
        const api = new ExampleApi(basename);
        const cart = {
            getState: jest.fn().mockReturnValue({
                1: { name: mockProducts[0].name, count: 2, price: mockProducts[0].price },
                2: { name: mockProducts[1].name, count: 2, price: mockProducts[1].price },
            }),
            setState: jest.fn()
        };
        const store = initStore(api, cart);

        const application = (
            <MemoryRouter initialEntries={[basename + '/cart']} basename={basename}>
                <Provider store={store}>
                    <Application />
                </Provider>
            </MemoryRouter>
        );

        const { container } = render(application);

        await waitFor(() => {
            expect(screen.getByRole("table")).toBeInTheDocument();
            expect(screen.getByText(mockProducts[0].name)).toBeInTheDocument();
            expect(screen.getByText(mockProducts[1].name)).toBeInTheDocument();

            const row1 = screen.getByRole('row', {
                name: `1 ${mockProducts[0].name} $${mockProducts[0].price} 2 $${mockProducts[0].price * 2}`
            });
            const row2 = screen.getByRole('row', {
                name: `2 ${mockProducts[1].name} $${mockProducts[1].price} 2 $${mockProducts[1].price * 2}`
            });
            expect(row1).toBeInTheDocument();
            expect(row2).toBeInTheDocument();
            const totalPriceValue = mockProducts[0].price * 2 + mockProducts[1].price * 2;
            const totalPrice = screen.getByRole('cell', {
                name: `$${totalPriceValue}`
            })
            expect(totalPrice).toBeInTheDocument();
        });
    });

    it('кнопка "очистить корзину", по нажатию на которую все товары должны удаляться', async () => {
        const api = new ExampleApi(basename);
        const cart = {
            getState: jest.fn().mockReturnValue({
                1: { name: mockProducts[0].name, count: 2, price: mockProducts[0].price },
                2: { name: mockProducts[1].name, count: 2, price: mockProducts[1].price },
            }),
            setState: jest.fn()
        };
        const store = initStore(api, cart);

        const application = (
            <MemoryRouter initialEntries={[basename + '/cart']} basename={basename}>
                <Provider store={store}>
                    <Application />
                </Provider>
            </MemoryRouter>
        );

        const { container } = render(application);

        await waitFor(() => {
            const clearBtn = screen.getByRole('button', {
                name: /clear shopping cart/i
            });
            expect(clearBtn).toBeInTheDocument();

            fireEvent.click(clearBtn);

            expect(screen.getByText(/cart is empty\. please select products in the \./i)).toBeInTheDocument();
        });
    });

    it('если корзина пустая, должна отображаться ссылка на каталог товаров', async () => {
        const api = new ExampleApi(basename);
        const cart = new CartApi();
        const store = initStore(api, cart);

        const application = (
            <MemoryRouter initialEntries={[basename + '/cart']} basename={basename}>
                <Provider store={store}>
                    <Application />
                </Provider>
            </MemoryRouter>
        );

        const { container } = render(application);

        await waitFor(() => {
            const view = screen.getByText(
                /cart is empty\. please select products in the \./i);
            expect(view).toBeInTheDocument();
            within(view).getByRole('link', {
                name: /catalog/i
            });
        });
    });


})


