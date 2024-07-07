import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Application } from '../../src/client/Application';

import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { initStore } from '../../src/client/store';
import { ExampleApi, CartApi } from '../../src/client/api';

const basename = '/hw/store';

describe('Страницы', () => {
    it('статические страницы: главная, каталог, условия доставки, контакты', () => {
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

        const homepageLink = screen.getByRole('link', { name: "Kogtetochka store" });
        fireEvent.click(homepageLink);

        expect(screen.getByText("Welcome to Kogtetochka store!")).toBeInTheDocument();


        const catalogLink = screen.getByRole('link', { name: "Catalog" });
        fireEvent.click(catalogLink);

        expect(screen.getByText('Catalog', { selector: 'h1' })).toBeInTheDocument();


        const deliveryLink = screen.getByRole('link', { name: "Delivery" });
        fireEvent.click(deliveryLink);

        expect(screen.getByText('Delivery', { selector: 'h1' })).toBeInTheDocument();


        const contactsLink = screen.getByRole('link', { name: "Contacts" });
        fireEvent.click(contactsLink);

        expect(screen.getByText('Contacts', { selector: 'h1' })).toBeInTheDocument();
    });
})



