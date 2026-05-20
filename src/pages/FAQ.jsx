import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import './StaticPages.css';

const faqs = [
  { q: 'كيف أطلب منتجاً جاهزاً؟', a: 'اختاري المنتج المناسب من قسم "المنتجات الجاهزة"، حددي اللون والمقاس والكمية، أضيفيه للسلة ثم أكملي بيانات الطلب والدفع.' },
  { q: 'كم تستغرق مدة التوصيل؟', a: 'تتراوح مدة التوصيل بين 3 و7 أيام عمل حسب الولاية. يتم التواصل معكِ بعد تأكيد الطلب لتحديد موعد التسليم.' },
  { q: 'هل يمكن إرجاع المنتجات؟', a: 'نعم، يمكن إرجاع المنتجات خلال 7 أيام من الاستلام شرط أن تكون في حالتها الأصلية ولم تُلبس.' },
  { q: 'كيف أطلب تصميماً خاصاً؟', a: 'توجهي لقسم "تصميم حسب الطلب"، أدخلي بياناتكِ وتفاصيل التصميم المطلوب، وسيتواصل معكِ فريق التصميم خلال 24 ساعة.' },
  { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل الدفع عند الاستلام، التحويل البنكي، والبطاقة البنكية.' },
  { q: 'هل تتوفر مقاسات كبيرة (Plus Size)؟', a: 'نعم، نوفر مقاسات من S إلى XXL، وللمقاسات الأكبر يمكنكِ طلب تصميم مخصص بمقاساتكِ الدقيقة.' },
  { q: 'كم تستغرق مدة التصميم الخاص؟', a: 'تتراوح مدة تنفيذ التصميمات الخاصة بين 10 و21 يوم عمل حسب تعقيد التصميم والكمية المطلوبة.' },
  { q: 'هل يمكن تتبع طلبي؟', a: 'نعم، سيتم التواصل معكِ بشكل دوري لإعلامكِ بحالة طلبكِ من مرحلة التأكيد حتى التسليم.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="static-page" style={{ paddingTop: 96, paddingBottom: 80 }}>
      <div className="container">
        <div className="static-page__hero">
          <HelpCircle size={48} className="static-page__hero-icon" />
          <h1 className="section-title">الأسئلة الشائعة</h1>
          <p>إجابات على أكثر الأسئلة شيوعاً من عميلاتنا</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
              <button className="faq-item__q" onClick={() => setOpen(open === i ? null : i)}>
                <span>{faq.q}</span>
                <ChevronDown size={18} className="faq-item__arrow" />
              </button>
              {open === i && <div className="faq-item__a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
