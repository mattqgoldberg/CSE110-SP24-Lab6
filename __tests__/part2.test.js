const { Mouse } = require("puppeteer");

describe('Crud app features', () => {

    beforeAll(async () => {
        await page.goto('http://127.0.0.1:5500/index.html');
    });
    
    it('UI hover on and off add note', async () => {
        let button = await page.$('button');
        let buttonVal = await (await button.getProperty('innerText')).jsonValue();

        //Checks before mouse hover
        expect(buttonVal).toBe('Add Note');

        //Check after mouseover
        await page.hover('button');
        buttonVal = await (await button.getProperty('innerText')).jsonValue();
        expect(buttonVal).toBe('+');

        //Check after mouseoff
        await page.mouse.move(0, 0);
        buttonVal = await (await button.getProperty('innerText')).jsonValue();
        expect(buttonVal).toBe('Add Note');

    });

    it('click and add notes', async () => {
        //Clicks add 5 times
        let button = await page.$('button');
        for (let i = 0; i < 5; i++) {
            await button.click();
        }

        //Checks there are 5 notes
        let notes = await page.$$('textarea');
        expect(notes.length).toBe(5);

        for (let i = 0; i < notes.length; i++) {
            let noteText = await (await notes[i].getProperty('innerText')).jsonValue();
            expect(noteText).toBe('');
        }
    });

    it('edit notes', async () => {
        //Types in the first note
        let note = await page.$('textarea');
        await note.click();
        await page.keyboard.type('hello world!');

        let noteText = await (await note.getProperty('value')).jsonValue();
        await page.keyboard.press('Tab');
        expect(noteText).toBe('hello world!');


    });

    it('local storage after adding', async () => {
        await page.reload();

        let notes = await page.$$('textarea');
        expect(notes.length).toBe(5);


        let noteText = await (await notes[0].getProperty('value')).jsonValue();
        expect(noteText).toBe('hello world!');

        for (let i = 1; i < notes.length; i++) {
            let noteText = await (await notes[i].getProperty('value')).jsonValue();
            expect(noteText).toBe('');
        }
    });

    it('delete notes', async () => {
        let note = await page.$('textarea');
        await note.click({clickCount: 2});
        let notes = await page.$$('textarea');
        expect(notes.length).toBe(4);
    });

    it('delete all notes', async () => {

        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        await page.keyboard.down('Control');
        await page.keyboard.down('Shift');
        await page.keyboard.press('D');
        await page.keyboard.up('Control');
        await page.keyboard.up('Shift');

        
        await page.keyboard.press('Enter');

        let notes = await page.$$('textarea');
        expect(notes.length).toBe(0);
    });

    it('local storage after deleting', async () => {
        let savedNotes = await page.evaluate(() => {
            return localStorage.getItem('stickynotes-notes');
        });
        expect(savedNotes).toBe("[]");
    });

});