import { validatePhone } from "../lib/validators";

export const validateProfile = (profileData) => {
    const errors = {
        fullName: "",
        dob: "",
        gender: "",
        phone: "",
        country: ""
    };

    // Full Name — validate only if provided
    if (profileData.fullName?.trim()) {
        if (profileData.fullName.trim().length < 2) {
            errors.fullName = "Full name must be at least 2 characters";
        }
    }

    // Date of Birth — validate only if provided
    if (profileData.dob) {
        const dob = new Date(profileData.dob);
        const today = new Date();

        if (Number.isNaN(dob.getTime())) {
            errors.dob = "Please enter a valid date of birth";

        } else if (dob > today) {
            errors.dob = "Date of birth cannot be in the future";

        } else {
            let age = today.getFullYear() - dob.getFullYear();

            const monthDiff = today.getMonth() - dob.getMonth();

            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < dob.getDate())
            ) {
                age--;
            }

            if (age < 18) {
                errors.dob = "You must be at least 18 years old";
            }
        }
    }

    // Gender — validate only if provided
    if (
        profileData.gender &&
        !["male", "female", "other"].includes(profileData.gender)
    ) {
        errors.gender = "Please select a valid gender";
    }

    // Phone — validate only if provided
    if (profileData.phone?.trim()) {
        if (!validatePhone(profileData.phone)) {
            errors.phone = "Please enter a valid 10-digit phone number";
        }
    }

    // Country — validate only if provided
    if (profileData.country?.trim()) {
        if (profileData.country.trim().length < 2) {
            errors.country = "Please enter a valid country name";
        }
    }

    return errors;
};
