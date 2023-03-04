const check = [
    {
        type: "select",
        name: "domain",
        message: "What domain do you want to check?",
        choices: [
            { value: "is-a-backend.dev" },
            { value: "is-a-frontend.dev" },
            { value: "is-a-fullstack.dev" }
        ]
    },

    {
        type: "text",
        name: "subdomain",
        message: "What subdomain would you like to check?"
    }
]

const register = [
    {
        type: "select",
        name: "domain",
        message: "What domain do you want your subdomain to use?",
        choices: [
            { value: "is-a-backend.dev" },
            { value: "is-a-frontend.dev" },
            { value: "is-a-fullstack.dev" }
        ]
    },

    {
        type: "text",
        name: "subdomain",
        message: "What subdomain would you like?"
    },

    {
        type: "select",
        name: "record",
        message: "What type of record do you want to use?",
        choices: [
            { value: "A" },
            { value: "AAAA" },
            { value: "CNAME" }
        ]
    },

    {
        type: "text",
        name: "record_value",
        message: "What should the value of the record be?"
    },

    {
        type: "select",
        name: "proxy_state",
        message: "Should the record be proxied through Cloudflare?",
        choices: [
            { title: "No (recommended)", value: "false" },
            { title: "Yes", value: "true" }
        ]
    }
]

const remove = [
    {
        type: "select",
        name: "domain",
        message: "What domain does your subdomain use?",
        choices: [
            { value: "is-a-backend.dev" },
            { value: "is-a-frontend.dev" },
            { value: "is-a-fullstack.dev" }
        ]
    },

    {
        type: "text",
        name: "subdomain",
        message: "What is your subdomain?"
    },

    {
        type: "confirm",
        name: "confirmation",
        message: "Are you sure you want to delete your subdomain?"
    }
]



const update = [
    {
        type: "select",
        name: "domain",
        message: "What domain does your subdomain use?",
        choices: [
            { value: "is-a-backend.dev" },
            { value: "is-a-frontend.dev" },
            { value: "is-a-fullstack.dev" }
        ]
    },

    {
        type: "text",
        name: "subdomain",
        message: "What is your subdomain?"
    },

    {
        type: "select",
        name: "record",
        message: "What type of record do you want to use?",
        choices: [
            { value: "A" },
            { value: "AAAA" },
            { value: "CNAME" }
        ]
    },

    {
        type: "text",
        name: "record_value",
        message: "What should the value of the record be?"
    },

    {
        type: "select",
        name: "proxy_state",
        message: "Should the record be proxied through Cloudflare?",
        choices: [
            { title: "No (recommended)", value: "false" },
            { title: "Yes", value: "true" }
        ]
    }
]

module.exports = {
    check,
    register,
    remove,
    update
}
