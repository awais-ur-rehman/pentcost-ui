// Chrome AI Console Test Script
// Copy and paste this into your browser's DevTools console to test Chrome AI availability

console.log('🧪 Chrome AI Console Test Starting...');

// Test 1: Basic window.ai availability
console.log('\n1. Testing window.ai availability:');
if (typeof window !== 'undefined' && window.ai) {
    console.log('✅ window.ai is available');
    console.log('Available APIs:', Object.keys(window.ai));
} else {
    console.log('❌ window.ai is not available');
    console.log('Make sure you are using Chrome 127+ with AI features enabled');
}

// Test 2: LanguageModel availability
console.log('\n2. Testing LanguageModel.availability():');
try {
    if (window.ai && window.ai.languageModel && window.ai.languageModel.availability) {
        const result = await window.ai.languageModel.availability();
        console.log('✅ LanguageModel.availability() result:', result);
        
        switch (result) {
            case 'available':
                console.log('🎉 Language model is ready to use!');
                break;
            case 'downloadable':
                console.log('📥 Language model needs to be downloaded');
                console.log('💡 User interaction required to start download');
                break;
            case 'downloading':
                console.log('⬇️ Language model is currently downloading...');
                break;
            case 'unavailable':
                console.log('❌ Language model is not available on this device');
                break;
            default:
                console.log('❓ Unknown availability status:', result);
        }
    } else {
        console.log('❌ LanguageModel.availability() method not found');
    }
} catch (error) {
    console.log('❌ Error calling LanguageModel.availability():', error.message);
}

// Test 3: Proofreader availability
console.log('\n3. Testing Proofreader availability:');
try {
    if (window.ai && window.ai.proofreader) {
        if (window.ai.proofreader.availability) {
            const result = await window.ai.proofreader.availability();
            console.log('✅ Proofreader.availability() result:', result);
        } else {
            console.log('ℹ️ Proofreader API available but no availability method');
        }
    } else {
        console.log('❌ Proofreader API not available');
    }
} catch (error) {
    console.log('❌ Error checking Proofreader availability:', error.message);
}

// Test 4: User Activation status
console.log('\n4. Testing User Activation:');
if ('userActivation' in navigator) {
    console.log('✅ navigator.userActivation is available');
    console.log('User activation active:', navigator.userActivation.isActive);
    if (!navigator.userActivation.isActive) {
        console.log('💡 Click somewhere on the page to activate user interaction');
    }
} else {
    console.log('❌ navigator.userActivation not available');
}

// Test 5: System Information
console.log('\n5. System Information:');
console.log('User Agent:', navigator.userAgent);
console.log('Platform:', navigator.platform);
console.log('Language:', navigator.language);
console.log('Online:', navigator.onLine);

// Test 6: Try to create a Proofreader session (if available)
console.log('\n6. Testing Proofreader session creation:');
try {
    if (window.ai && window.ai.proofreader && window.ai.proofreader.create) {
        console.log('Attempting to create Proofreader session...');
        
        if (!navigator.userActivation.isActive) {
            console.log('⚠️ User activation required. Click somewhere on the page first.');
        } else {
            const session = await window.ai.proofreader.create({
                expectedInputLanguages: ['en'],
                monitor: (monitor) => {
                    monitor.addEventListener('downloadprogress', (e) => {
                        console.log(`📥 Download progress: ${e.loaded * 100}%`);
                    });
                }
            });
            console.log('✅ Proofreader session created successfully!');
            
            // Test proofreading
            console.log('Testing proofreading functionality...');
            const result = await session.proofread('This is a test text with some errors.');
            console.log('✅ Proofreading test successful!');
            console.log('Original:', 'This is a test text with some errors.');
            console.log('Corrected:', result.correction);
            console.log('Corrections found:', result.corrections.length);
        }
    } else {
        console.log('❌ Cannot create Proofreader session - API not available');
    }
} catch (error) {
    console.log('❌ Error creating Proofreader session:', error.message);
    if (error.message.includes('User activation required')) {
        console.log('💡 Try clicking on the page and running this test again');
    }
}

console.log('\n🏁 Chrome AI Console Test Complete!');

// Export functions for manual testing
window.chromeAITest = {
    async testAvailability() {
        return await window.ai?.languageModel?.availability?.();
    },
    
    async createProofreaderSession() {
        if (!navigator.userActivation.isActive) {
            throw new Error('User activation required. Click on the page first.');
        }
        return await window.ai.proofreader.create({
            expectedInputLanguages: ['en']
        });
    },
    
    async testProofread(text = 'This is a test text with some errors.') {
        const session = await this.createProofreaderSession();
        return await session.proofread(text);
    }
};

console.log('\n🔧 Manual test functions available:');
console.log('- window.chromeAITest.testAvailability()');
console.log('- window.chromeAITest.createProofreaderSession()');
console.log('- window.chromeAITest.testProofread("your text here")');
