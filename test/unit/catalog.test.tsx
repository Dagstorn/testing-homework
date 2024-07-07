import axios from 'axios';
import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Application } from '../../src/client/Application';

import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { initStore } from '../../src/client/store';
import { ExampleApi, CartApi } from '../../src/client/api';

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

describe("тест страницы Каталог", () => {
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

    it('список товаров рендерится, короткая и подробная информация отображается', async () => {
        const api = new ExampleApi(basename);
        const cart = new CartApi();

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

        fireEvent.click(screen.getByRole('link', {
            name: /catalog/i
        }));

        await waitFor(() => {
            mockProducts.forEach(product => {
                const outerProductElement = screen.getAllByTestId(`${product.id}`)[0];
                const productElement = within(outerProductElement).getByTestId(`${product.id}`);

                expect(productElement).toHaveTextContent(product.name);
                expect(productElement).toHaveTextContent(`$${product.price}`);
                const link = productElement.querySelector('a');
                expect(link).toHaveAttribute('href', `/hw/store/catalog/${product.id}`);
                expect(link).toHaveTextContent('Details');
            });
        });

        const firstProductLink = screen.getAllByRole('link', { name: /Details/i })[0];
        fireEvent.click(firstProductLink);

        await waitFor(() => {
            const product = mockProducts[0];

            expect(screen.getByText(product.name)).toBeInTheDocument();
            expect(screen.getByText(`$${product.price}`)).toBeInTheDocument();
            expect(screen.getByText(product.description)).toBeInTheDocument();
            expect(screen.getByText(product.color)).toBeInTheDocument();
            expect(screen.getByText(product.material)).toBeInTheDocument();

            expect(screen.getByRole('button', { name: /Add to Cart/i })).toBeInTheDocument();

        });
    });

    it('сообщение о том что товар уже в корзине', async () => {
        const api = new ExampleApi(basename);
        const cart = {
            getState: jest.fn().mockReturnValue({
                1: { name: 'Incredible kogtetochka', count: 1, price: 348 }
            }),
            setState: jest.fn()
        };
        const store = initStore(api, cart);


        const application = (
            <MemoryRouter basename={basename} initialEntries={[basename + '/catalog/1']}>
                <Provider store={store}>
                    <Application />
                </Provider>
            </MemoryRouter>
        );
        const { container } = render(application);

        await waitFor(() => {
            expect(screen.getByText('Item in cart')).toBeInTheDocument();
        });
    });

    it('повторное нажатие кнопки "добавить в корзину"', async () => {
        const api = new ExampleApi(basename);
        const cart = {
            getState: jest.fn().mockReturnValue({
                1: { name: 'Incredible kogtetochka', count: 1, price: 348 }
            }),
            setState: jest.fn()
        };
        const store = initStore(api, cart);


        const application = (
            <MemoryRouter basename={basename} initialEntries={[basename + '/catalog/1']}>
                <Provider store={store}>
                    <Application />
                </Provider>
            </MemoryRouter>
        );
        const { container } = render(application);

        await waitFor(() => {
            expect(screen.getByText('Item in cart')).toBeInTheDocument();
        });

        const addToCartButton = screen.getByRole('button', { name: /Add to Cart/i });
        fireEvent.click(addToCartButton);
        fireEvent.click(addToCartButton);

        await waitFor(() => {
            expect(cart.setState).toHaveBeenCalledWith({
                1: { name: 'Incredible kogtetochka', count: 3, price: 348 }
            });
        });
    });

    test('preserves cart content between reloads', async () => {
        const api = new ExampleApi(basename);
        const cartApi = new CartApi();
        const store = initStore(api, cartApi);

        const application = (
            <MemoryRouter basename={basename} initialEntries={[basename + '/catalog/1']}>
                <Provider store={store}>
                    <Application />
                </Provider>
            </MemoryRouter>
        );
        const { unmount } = render(application);

        await waitFor(() => {
            expect(screen.queryByText('LOADING')).not.toBeInTheDocument();
            expect(screen.getByText(mockProducts[0].name)).toBeInTheDocument();
        });

        const addToCartButton = screen.getByRole('button', { name: /Add to Cart/i });
        fireEvent.click(addToCartButton);

        expect(JSON.parse(localStorage.getItem(LOCAL_STORAGE_CART_KEY) as string)).toEqual({
            1: { name: 'Incredible kogtetochka', count: 1, price: 348 }
        });
        unmount();

        const newApplication = (
            <MemoryRouter basename={basename} initialEntries={[basename + '/catalog/1']}>
                <Provider store={initStore(api, cartApi)}>
                    <Application />
                </Provider>
            </MemoryRouter>
        );
        render(newApplication);


        fireEvent.click(
            screen.getByRole('link', {
                name: /cart/i
            })
        );

        await waitFor(() => {
            expect(screen.getByText(mockProducts[0].name)).toBeInTheDocument();
        });
    });

})


