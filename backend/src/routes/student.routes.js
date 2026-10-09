const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { enforceTenant } = require('../middlewares/tenant.middleware');

router.use(authenticate);
router.use(enforceTenant);

router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']), studentController.createStudent);
router.put('/parents/:parentId', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), studentController.updateParent);
router.put('/:id/stops', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT']), studentController.updateStudentStops);
router.put('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT']), studentController.updateStudent);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), studentController.deleteStudent);

module.exports = router;
