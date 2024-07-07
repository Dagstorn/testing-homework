import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Application } from '../../src/client/Application';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { initStore } from '../../src/client/store';
import { ExampleApi, CartApi } from '../../src/client/api';
const basename = '/hw/store';

const MockApp = () => {
    const api = new ExampleApi(basename);
    const cart = new CartApi();
    const store = initStore(api, cart);
    return (
        <BrowserRouter basename={basename}>
            <Provider store={store}>
                <Application />
            </Provider>
        </BrowserRouter>
    );
}

describe("Общие требования", () => {
    it('вёрстка должна адаптироваться под ширину экрана', () => {
        window.history.pushState({}, 'Test page', basename);
        const { container } = render(<MockApp />);
        act(() => {
            global.innerWidth = 500;
            global.dispatchEvent(new Event('resize'));
        });
        const hamburgerButton = screen.getByRole('button', { name: "Toggle navigation" });
        expect(hamburgerButton).toBeInTheDocument();
    });

    it('в шапке отображаются ссылки на страницы', () => {
        window.history.pushState({}, 'Test page', basename);

        render(<MockApp />);

        screen.getByRole('link', {
            name: /kogtetochka store/i
        })
        expect(screen.getByRole('link', {
            name: /catalog/i
        })).toBeInTheDocument();
        expect(screen.getByRole('link', {
            name: /delivery/i
        })).toBeInTheDocument();
        expect(screen.getByRole('link', {
            name: /contacts/i
        })).toBeInTheDocument();
        expect(screen.getByRole('link', {
            name: /cart/i
        })).toBeInTheDocument();
    });

    it('название магазина в шапке должно быть ссылкой на главную страницу', () => {
        window.history.pushState({}, 'Test page', basename);

        render(<MockApp />);

        // const linkElement = screen.getByText(/Kogtetochka store/i);
        const link = screen.getByText("Kogtetochka store");
        expect(link).toHaveAttribute('href', basename);
    });

    it('навигационное меню', async () => {
        window.history.pushState({}, 'Test page', basename);

        const { container } = render(<MockApp />);

        act(() => {
            global.innerWidth = 500;
            global.dispatchEvent(new Event('resize'));
        });
        await waitFor(() => {
            expect(global.innerWidth).toBe(500);
        });
        const applicationMenu = container.querySelector('.Application-Menu');
        if (applicationMenu === null) {
            throw new Error("Application menu is not in the page");
        }
        expect(applicationMenu).toHaveClass('collapse');

        const hamburgerButton = screen.getByRole('button', { name: "Toggle navigation" });
        expect(hamburgerButton).toBeInTheDocument();
        expect(getComputedStyle(hamburgerButton).display).not.toBe('none');

        fireEvent.click(hamburgerButton);
        expect(applicationMenu).not.toHaveClass('collapse');

        const link = screen.getByText("Catalog");
        fireEvent.click(link);
        expect(applicationMenu).toHaveClass('collapse');

    });
})






