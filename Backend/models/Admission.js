import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema(
    {
        name:           { type: String, required: true },
        email:          { type: String, required: true, unique: true, lowercase: true },
        phone:          { type: String, required: true },
        photo:          { type: String, default: '' },
        photoPublicId:  { type: String, default: '' },
        course:         { type: String, required: true },
        batchId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
        enrollmentId:   { type: String, default: '' },
        admissionDate:  { type: Date, default: Date.now },
        address:        { type: String, default: '' },
        parentName:     { type: String, default: '' },
        parentPhone:    { type: String, default: '' },
        qualifications: { type: String, default: '' },
        status: {
            type:    String,
            enum:    ['active', 'inactive', 'completed'],
            default: 'active'
        },
        isUserCreated: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// ✅ No next() — return promise directly, mongoose handles it
admissionSchema.pre('save', async function () {
    if (!this.enrollmentId) {
        const year  = new Date().getFullYear();
        const count = await mongoose.model('Admission').countDocuments();
        this.enrollmentId = `IDA${year}${String(count + 1).padStart(4, '0')}`;
        console.log('✅ enrollmentId:', this.enrollmentId);
    }
});

const Admission = mongoose.model('Admission', admissionSchema);
export default Admission;