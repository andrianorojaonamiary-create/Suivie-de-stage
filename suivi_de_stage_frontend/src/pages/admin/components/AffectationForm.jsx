import { useState, useMemo } from 'react';
import { FaTimes, FaUserPlus, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

import SelectPersonnalise from '../../../components/Common/SelectPersonnalise';
import { getApiErrorMessage } from '../../../api/apiClient';
import { teacherAssignmentsApi } from '../../../api';

function AffectationForm({ options, prefillStudentId, existingAssignments, onClose, onSaved }) {
  // La modale est montee/remontee a chaque ouverture (rendu conditionnel
  // dans Affectations.jsx) : l'initialisation suffit, pas besoin d'effet pour
  // resynchroniser prefillStudentId.
  const [studentId, setStudentId] = useState(prefillStudentId || '');
  const [teacherId, setTeacherId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Un étudiant n'a qu'un seul tuteur actif : on affiche celui qui existe déjà
  // et on bloque la soumission, plutôt que de laisser le backend renvoyer un 409.
  const existingTuteur = useMemo(
    () =>
      (existingAssignments || []).find(
        (a) => a.studentId === studentId && !a.dateFin,
      ) ?? null,
    [studentId, existingAssignments],
  );

  const studentOptions = (options?.students ?? []).map((s) => ({
    value: s.id,
    label: `${s.prenom} ${s.nom} — ${s.matricule}`.trim(),
  }));

  const teacherOptions = (options?.teachers ?? []).map((t) => ({
    value: t.id,
    label: `${t.nom} ${t.prenom} — ${t.assignmentCount ?? 0} étudiant(s)`.trim(),
  }));

  const hasTeachers = (options?.teachers ?? []).length === 0;
  const alreadyHasTuteur = Boolean(existingTuteur);
  const blocked = hasTeachers || alreadyHasTuteur;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) {
      toast.error('Sélectionnez un étudiant.');
      return;
    }
    if (!teacherId) {
      toast.error('Sélectionnez un enseignant.');
      return;
    }

    setSubmitting(true);
    try {
      await teacherAssignmentsApi.create({ studentId, teacherId });
      toast.success('Tuteur pédagogique affecté.');
      onSaved();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "L'affectation a échoué."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay admin-affectation-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <FaUserPlus /> Affecter un tuteur pédagogique
          </h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {hasTeachers && (
              <div className="admin-affectation-warning">
                <FaInfoCircle /> Aucun enseignant actif n&apos;est enregistré.
                Créez d&apos;abord un compte avec le rôle ENSEIGNANT.
              </div>
            )}

            {alreadyHasTuteur && (
              <div className="admin-affectation-warning">
                <FaInfoCircle />
                {[existingTuteur.teacher?.prenom, existingTuteur.teacher?.nom]
                  .filter(Boolean)
                  .join(' ')}{' '}
                est déjà le tuteur de cet étudiant. Clôturez son affectation
                depuis la liste pour le remplacer.
              </div>
            )}

            <div className="form-group">
              <label>Étudiant</label>
              <SelectPersonnalise
                value={studentId}
                onChange={setStudentId}
                placeholder="Sélectionner un étudiant"
                className="form-control"
                options={studentOptions}
                searchable
              />
            </div>

            <div className="form-group">
              <label>Tuteur pédagogique</label>
              <SelectPersonnalise
                value={teacherId}
                onChange={setTeacherId}
                placeholder={
                  hasTeachers
                    ? 'Aucun enseignant disponible'
                    : 'Sélectionner un enseignant'
                }
                className="form-control"
                options={teacherOptions}
                disabled={hasTeachers}
                searchable
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || blocked}>
              {submitting ? 'Affectation...' : 'Affecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AffectationForm;