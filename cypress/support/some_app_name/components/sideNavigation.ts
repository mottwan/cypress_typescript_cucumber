export class SideNavigation {
    private sideNavigationItemSelector: string = 'aside section span';
    private sideNavigationMenuSelector: string = 'aside header';
    private sideNavigationMenuChevron = (menu: string) =>
        cy.contains('aside header', menu).find('div svg');

    clickOnNavigationItem(navigationItem: string) {
        cy.contains(this.sideNavigationItemSelector, navigationItem).click();
        return this;
    }

    expandNavigationMenu(navigationMenuName: string) {
        this.sideNavigationMenuChevron(navigationMenuName)
            .invoke('attr', 'data-icon')
            .then((chevron) => {
                if (chevron == 'chevron-down') {
                    cy.contains(
                        this.sideNavigationMenuSelector,
                        navigationMenuName,
                    ).click();
                }
            });
        return this;
    }

    collapseNavigationMenu(navigationMenuName: string) {
        this.sideNavigationMenuChevron(navigationMenuName)
            .invoke('attr', 'data-icon')
            .then((chevron) => {
                if (chevron == 'chevron-up') {
                    cy.contains(
                        this.sideNavigationMenuSelector,
                        navigationMenuName,
                    ).click();
                }
            });
        return this;
    }

    getNavigationItemLink(navigationItem: string) {
        return cy
            .contains(this.sideNavigationItemSelector, navigationItem)
            .parent()
            .invoke('attr', 'href');
    }

    navigationItemLinkShouldContain(item: string, link: string) {
        this.getNavigationItemLink(item).should('contain', link);
        return this;
    }
}
