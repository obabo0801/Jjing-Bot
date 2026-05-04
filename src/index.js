import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', async (input) => {
    const cmd = input.trim();

    switch (cmd) {
        case 'refresh':
            console.log('refresh');
            break;
    
        case 'exit':
            process.exit(0);
    }
});